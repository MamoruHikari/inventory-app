import axios from 'axios'
import { cookies } from 'next/headers'

interface SalesforceAccountData {
  Name: string
  Phone?: string
  Website?: string
  Industry?: string
  BillingStreet?: string
  BillingCity?: string
  BillingState?: string
  BillingCountry?: string
}

interface SalesforceContactData {
  FirstName: string
  LastName: string
  Email: string
  Phone?: string
  AccountId: string
  Title?: string
  Department?: string
}

class SalesforceClient {
  private async getStoredTokens() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('salesforce_access_token')?.value
    const instanceUrl = cookieStore.get('salesforce_instance_url')?.value
    
    console.log('Getting stored tokens:')
    console.log('- Access token exists:', !!accessToken)
    console.log('- Instance URL exists:', !!instanceUrl)
    
    return { accessToken, instanceUrl }
  }

  async createAccount(accountData: SalesforceAccountData): Promise<string> {
    const { accessToken, instanceUrl } = await this.getStoredTokens()
    
    if (!accessToken || !instanceUrl) {
      throw new Error('No valid Salesforce session found. Please reconnect to Salesforce.')
    }

    try {
      console.log('Creating Salesforce Account with data:', accountData)
      console.log('Using access token:', accessToken.substring(0, 20) + '...')
      console.log('Instance URL:', instanceUrl)

      const response = await axios.post(
        `${instanceUrl}/services/data/v58.0/sobjects/Account`,
        accountData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Salesforce Account created successfully:', response.data.id)
      return response.data.id
      
    } catch (error: any) {
      console.error('Failed to create Salesforce Account:', error.response?.data || error.message)
      
      if (error.response?.status === 401) {
        throw new Error('Salesforce session expired. Please reconnect to Salesforce.')
      }
      
      if (error.response?.data) {
        const errorDetails = error.response.data
        if (errorDetails.length > 0 && errorDetails[0].message) {
          throw new Error(`Salesforce error: ${errorDetails[0].message}`)
        }
      }
      
      throw new Error('Failed to create Salesforce Account. Please try again.')
    }
  }

  async createContact(contactData: SalesforceContactData): Promise<string> {
    const { accessToken, instanceUrl } = await this.getStoredTokens()
    
    if (!accessToken || !instanceUrl) {
      throw new Error('No valid Salesforce session found. Please reconnect to Salesforce.')
    }

    try {
      console.log('Creating Salesforce Contact with data:', contactData)
      
      const response = await axios.post(
        `${instanceUrl}/services/data/v58.0/sobjects/Contact`,
        contactData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Salesforce Contact created successfully:', response.data.id)
      return response.data.id
      
    } catch (error: any) {
      console.error('Failed to create Salesforce Contact:', error.response?.data || error.message)
      
      if (error.response?.status === 401) {
        throw new Error('Salesforce session expired. Please reconnect to Salesforce.')
      }
      
      if (error.response?.data) {
        const errorDetails = error.response.data
        if (errorDetails.length > 0 && errorDetails[0].message) {
          throw new Error(`Salesforce error: ${errorDetails[0].message}`)
        }
      }
      
      throw new Error('Failed to create Salesforce Contact. Please try again.')
    }
  }
}

export const salesforceClient = new SalesforceClient()
export type { SalesforceAccountData, SalesforceContactData }
