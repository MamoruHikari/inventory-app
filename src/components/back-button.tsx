'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackHref?: string
  className?: string
}

export function BackButton({ fallbackHref = '/', className = '' }: BackButtonProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const fromParam = searchParams.get('from')
  
  const handleBack = () => {
    if (fromParam) {
      router.push(fromParam)
    } else if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  if (fromParam) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className={`w-10 h-10 p-0 ${className}`}
        onClick={handleBack}
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <Link href={fallbackHref}>
      <Button variant="ghost" size="sm" className={`w-10 h-10 p-0 ${className}`}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
    </Link>
  )
}