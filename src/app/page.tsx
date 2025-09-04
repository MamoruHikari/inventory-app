import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth-button"
import { createClient } from "@/lib/supabase/server"

export default async function Index() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Inventory Manager</h1>
          <AuthButton redirectTo="/" />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Inventory Manager
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Manage your inventories with custom fields and powerful organization
            </p>
          </div>
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inventory">
              <Button size="lg" className="w-full sm:w-auto">
                View All Inventories
              </Button>
            </Link>
            
            {user ? (
              <Link href="/inventory/new">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create New Inventory
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login?redirectTo=%2Finventory%2Fnew">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create New Inventory
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}