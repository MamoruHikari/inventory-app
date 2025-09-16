'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User as UserIcon, Calendar, Shield, Building, Globe, CheckCircle, AlertCircle } from 'lucide-react'
import { SalesforceIntegrationForm } from '@/components/forms/salesforce-integration-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BackButton } from '@/components/back-button'

interface UserStats {
  totalInventories: number
  publicInventories: number
  privateInventories: number
  totalItems: number
  totalComments: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSalesforceForm, setShowSalesforceForm] = useState(false)
  const [salesforceConnected, setSalesforceConnected] = useState(false)
  const [oneDriveConnected, setOneDriveConnected] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [connecting, setConnecting] = useState(false)
  const [oneDriveConnecting, setOneDriveConnecting] = useState(false)

  useEffect(() => {
    fetchUserData()
    fetchUserStats()
    checkSalesforceConnection()
    checkOneDriveConnection()
    
    handleOAuthResults()
  }, [])

  const handleOAuthResults = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    const microsoft = urlParams.get('microsoft')
    const details = urlParams.get('details')
    
    if (success === 'salesforce_connected') {
      console.log('✅ Successfully connected to Salesforce!')
      setSalesforceConnected(true)
      setStatusMessage('Successfully connected to Salesforce! You can now export your data.')
      
      window.history.replaceState({}, '', window.location.pathname)
    } else if (microsoft === 'connected') {
      console.log('✅ Successfully connected to Microsoft OneDrive!')
      setOneDriveConnected(true)
      setOneDriveConnecting(false)
      setStatusMessage('Successfully connected to Microsoft OneDrive! Help button is now enabled.')
      
      window.history.replaceState({}, '', window.location.pathname)
    } else if (error) {
      console.log('❌ Connection error:', error, details)
      setSalesforceConnected(false)
      setOneDriveConnected(false)
      setStatusMessage(`Connection failed: ${decodeURIComponent(details || error)}`)
      setConnecting(false)
      setOneDriveConnecting(false)
      
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const checkSalesforceConnection = async () => {
    try {
      const response = await fetch('/api/salesforce/check-connection')
      if (response.ok) {
        const data = await response.json()
        setSalesforceConnected(data.connected)
      }
    } catch (error) {
      console.error('Error checking Salesforce connection:', error)
    }
  }

  const checkOneDriveConnection = async () => {
    try {
      const response = await fetch('/api/power-automate/upload-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      
      const result = await response.json()
      
      if (response.status === 401 && result.requiresConnection) {
        setOneDriveConnected(false)
      } else {
        setOneDriveConnected(true)
      }
    } catch (error) {
      console.error('Error checking OneDrive connection:', error)
      setOneDriveConnected(false)
    }
  }

  const handleSalesforceConnect = () => {
    console.log('🔗 Starting Salesforce OAuth flow...')
    setConnecting(true)
    setStatusMessage('Connecting to Salesforce...')
    window.location.href = '/api/auth/salesforce'
  }

  const handleOneDriveConnect = () => {
    console.log('🔗 Starting Microsoft OneDrive OAuth flow...')
    setOneDriveConnecting(true)
    setStatusMessage('Connecting to Microsoft OneDrive...')
    window.location.href = '/api/auth/microsoft'
  }

  const handleOneDriveDisconnect = async () => {
    try {
      console.log('🔌 Disconnecting from Microsoft OneDrive...')
      
      const response = await fetch('/api/auth/microsoft/disconnect', {
        method: 'POST'
      })
      
      if (response.ok) {
        setOneDriveConnected(false)
        setStatusMessage('Disconnected from Microsoft OneDrive. Help button will require reconnection.')
      } else {
        console.error('Failed to disconnect OneDrive')
        setStatusMessage('Failed to disconnect OneDrive. Please try again.')
      }
    } catch (error) {
      console.error('Error disconnecting OneDrive:', error)
      setStatusMessage('Error disconnecting OneDrive. Please try again.')
    }
  }

  const handleOpenExportForm = () => {
    setShowSalesforceForm(true)
  }

  const fetchUserData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/profile/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your account and integrations</p>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-lg border ${
            (salesforceConnected || oneDriveConnected) 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : (connecting || oneDriveConnecting)
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {(salesforceConnected || oneDriveConnected) ? (
                <CheckCircle size={16} />
              ) : (connecting || oneDriveConnecting) ? (
                <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
              ) : (
                <AlertCircle size={16} />
              )}
              <span className="text-sm font-medium">{statusMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon size={20} />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <UserIcon size={14} className="text-gray-600" />
                      </div>
                      <span className="font-medium">Email Address</span>
                    </div>
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar size={14} className="text-gray-600" />
                      </div>
                      <span className="font-medium">Member Since</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(user.created_at || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Shield size={14} className="text-gray-600" />
                      </div>
                      <span className="font-medium">Account Type</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Active User
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {stats ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Inventories</span>
                      <span className="font-medium">{stats.totalInventories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Public</span>
                      <span className="font-medium text-green-600">{stats.publicInventories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Private</span>
                      <span className="font-medium text-orange-600">{stats.privateInventories}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Items</span>
                      <span className="font-medium">{stats.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Comments</span>
                      <span className="font-medium">{stats.totalComments}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading stats...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    salesforceConnected ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Building size={20} className={
                      salesforceConnected ? 'text-green-600' : 'text-blue-600'
                    } />
                  </div>
                  <div>
                    <h3 className="font-medium">Salesforce CRM</h3>
                    <p className="text-sm text-muted-foreground">
                      {salesforceConnected 
                        ? 'Export your data with custom details' 
                        : 'Connect to export your profile data'
                      }
                    </p>
                  </div>
                </div>
                
                {salesforceConnected ? (
                  <Dialog open={showSalesforceForm} onOpenChange={setShowSalesforceForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={handleOpenExportForm}>
                        Export
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Export to Salesforce CRM</DialogTitle>
                      </DialogHeader>
                      <SalesforceIntegrationForm user={user} onClose={() => setShowSalesforceForm(false)} />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSalesforceConnect}
                    disabled={connecting}
                  >
                    {connecting ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    oneDriveConnected ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      oneDriveConnected ? 'text-green-600' : 'text-blue-600'
                    }`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.5 15.5C3.6 15.5 2 13.9 2 12s1.6-3.5 3.5-3.5c.3 0 .6 0 .9.1C7.1 7.1 8.8 6 10.8 6c2.4 0 4.4 1.9 4.4 4.3 0 .1 0 .2 0 .3.8-.4 1.7-.6 2.6-.6 2.9 0 5.2 2.3 5.2 5.2s-2.3 5.2-5.2 5.2H5.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.4 3.5-3.4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Microsoft OneDrive</h3>
                    <p className="text-sm text-muted-foreground">
                      {oneDriveConnected 
                        ? 'Support tickets enabled' 
                        : 'Connect for ticket automation'
                      }
                    </p>
                  </div>
                </div>
                
                {oneDriveConnected ? (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleOneDriveDisconnect}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleOneDriveConnect}
                    disabled={oneDriveConnecting}
                  >
                    {oneDriveConnecting ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}