/**
 * ClioService — STUBBED
 * All Clio API calls route through this interface.
 * When real credentials arrive, replace method bodies only.
 * No other files need to change.
 */

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

  private log(method: string, payload: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CLIO STUB] ${method}`, JSON.stringify(payload, null, 2))
    }
  }

  // API Endpoints for Reference:
  // POST /contacts -> { data: { first_name, last_name, email_addresses: [{ address, primary: true }], phone_numbers: [{ number, primary: true }], type: 'Person' } }
  // POST /matters -> { data: { display_number, status: 'Pending', client: { id: contact_id }, description, practice_area: { id: pa_id } } }

  async createContact(data: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }): Promise<ClioContact> {
    this.log('createContact', data)
    // STUB — returns mock response
    return {
      id: `clio_contact_${Date.now()}`,
      ...data,
    }
  }

  async createMatter(data: {
    contactId: string
    description: string
    practiceArea: string
  }): Promise<ClioMatter> {
    this.log('createMatter', data)
    return {
      id: `clio_matter_${Date.now()}`,
      status: 'Pending',
      ...data,
    }
  }

  async createTask(data: {
    matterId: string
    name: string
    dueAt: string
    assigneeId?: string
  }): Promise<ClioTask> {
    this.log('createTask', data)
    return {
      id: `clio_task_${Date.now()}`,
      ...data,
    }
  }

  async triggerOnboardingTemplate(matterId: string): Promise<void> {
    this.log('triggerOnboardingTemplate', { matterId })
    // STUB — in prod this fires Clio's matter template workflow
  }

  async getContactByEmail(email: string): Promise<ClioContact | null> {
    this.log('getContactByEmail', { email })
    // In prod: GET /contacts?email_address={{email}}
    return null
  }

  async getContactById(id: string): Promise<ClioContact | null> {
    this.log('getContactById', { id })
    return null
  }
}

export const ClioService = new ClioServiceClass()
