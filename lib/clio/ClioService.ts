export interface ClioContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface ClioMatter {
  id: string
  contactId: string
  description: string
  practiceArea: string
  status: 'Pending' | 'Open' | 'Closed'
}

export interface ClioTask {
  id: string
  matterId: string
  name: string
  dueAt: string
  assigneeId?: string
}

class ClioServiceClass {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = process.env.CLIO_BASE_URL || 'https://app.clio.com/api/v4'
    const token = process.env.CLIO_ACCESS_TOKEN

    if (!token) {
      throw new Error('CLIO_ACCESS_TOKEN is not configured')
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Clio API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async createContact(data: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }): Promise<ClioContact> {
    const res = await this.request<{ data: any }>('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'Person',
          first_name: data.firstName,
          last_name: data.lastName,
          email_addresses: [{ address: data.email, primary: true }],
          phone_numbers: [{ number: data.phone, primary: true }],
        },
      }),
    })

    return {
      id: String(res.data.id),
      firstName: res.data.first_name,
      lastName: res.data.last_name,
      email: data.email,
      phone: data.phone,
    }
  }

  async createMatter(data: {
    contactId: string
    description: string
    practiceArea: string
  }): Promise<ClioMatter> {
    const res = await this.request<{ data: any }>('/matters', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          status: 'Pending',
          description: data.description,
          client: { id: Number(data.contactId) },
          practice_area: { name: data.practiceArea },
        },
      }),
    })

    return {
      id: String(res.data.id),
      contactId: data.contactId,
      description: data.description,
      practiceArea: data.practiceArea,
      status: res.data.status ?? 'Pending',
    }
  }

  async createTask(data: {
    matterId: string
    name: string
    dueAt: string
    assigneeId?: string
  }): Promise<ClioTask> {
    const res = await this.request<{ data: any }>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          name: data.name,
          due_at: data.dueAt,
          matter: { id: Number(data.matterId) },
          ...(data.assigneeId ? { assignee: { id: Number(data.assigneeId), type: 'User' } } : {}),
        },
      }),
    })

    return {
      id: String(res.data.id),
      matterId: data.matterId,
      name: data.name,
      dueAt: data.dueAt,
    }
  }

  async triggerOnboardingTemplate(matterId: string): Promise<void> {
    // Clio does not expose a generic "apply template" endpoint.
    // Onboarding tasks are created individually via createTask().
    // This method is intentionally a no-op.
    void matterId
  }

  async getContactByEmail(email: string): Promise<ClioContact | null> {
    const res = await this.request<{ data: any[] }>(
      `/contacts?email_address=${encodeURIComponent(email)}&fields=id,first_name,last_name,email_addresses,phone_numbers`
    )

    const contact = res.data?.[0]
    if (!contact) return null

    return {
      id: String(contact.id),
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email_addresses?.[0]?.address ?? email,
      phone: contact.phone_numbers?.[0]?.number ?? '',
    }
  }

  async getContactById(id: string): Promise<ClioContact | null> {
    try {
      const res = await this.request<{ data: any }>(
        `/contacts/${id}?fields=id,first_name,last_name,email_addresses,phone_numbers`
      )
      const c = res.data
      return {
        id: String(c.id),
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email_addresses?.[0]?.address ?? '',
        phone: c.phone_numbers?.[0]?.number ?? '',
      }
    } catch {
      return null
    }
  }
}

export const ClioService = new ClioServiceClass()
