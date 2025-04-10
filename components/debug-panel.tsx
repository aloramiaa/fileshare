"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2, DatabaseIcon, BugIcon, AlertCircleIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function DebugPanel() {
  const [loading, setLoading] = useState(false)
  const [testFileResult, setTestFileResult] = useState<any>(null)
  const [showAllMessages, setShowAllMessages] = useState(false)
  const [filesResult, setFilesResult] = useState<any>(null)
  const [databaseError, setDatabaseError] = useState<string | null>(null)
  const [schemaFixResult, setSchemaFixResult] = useState<any>(null)

  const createTestFile = async () => {
    try {
      setLoading(true)
      setTestFileResult(null)
      
      const response = await fetch('/api/test/files', {
        method: 'POST'
      })
      
      const result = await response.json()
      setTestFileResult(result)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Test file created successfully"
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create test file",
          variant: "destructive"
        })
      }
      
    } catch (error) {
      console.error("Error creating test file:", error)
      toast({
        title: "Error",
        description: "Failed to create test file due to an exception",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const testFilesFetch = async () => {
    try {
      setLoading(true)
      setFilesResult(null)
      setDatabaseError(null)
      
      // Try to fetch files from the API
      const response = await fetch('/api/files')
      const result = await response.json()
      
      setFilesResult(result)
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Found ${result.data.length} files for your IP`
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch files",
          variant: "destructive"
        })
        
        // Check for specific database errors
        if (result.error && result.error.code) {
          if (result.error.code === '42P01') {
            setDatabaseError("The database table doesn't exist. Create a test file to fix this.")
          } else if (result.error.code.startsWith('28')) {
            setDatabaseError("Database permission error. Check your Supabase RLS policies.")
          } else if (result.error.code.startsWith('3D')) {
            setDatabaseError("Database configuration error. Check your Supabase connection.")
          }
        }
      }
      
    } catch (error) {
      console.error("Error testing files fetch:", error)
      toast({
        title: "Error",
        description: "Failed to test file fetching due to a network error",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fixDatabaseSchema = async () => {
    try {
      setLoading(true)
      setSchemaFixResult(null)
      
      // Call the schema fix API
      const response = await fetch('/api/test/fix-schema')
      const result = await response.json()
      
      setSchemaFixResult(result)
      
      if (result.success) {
        toast({
          title: "Schema Fixed",
          description: `Database schema updated: ${result.operations.join(', ')}`
        })
      } else {
        toast({
          title: "Schema Fix Failed",
          description: result.message || "Failed to fix schema",
          variant: "destructive"
        })
      }
      
    } catch (error) {
      console.error("Error fixing schema:", error)
      toast({
        title: "Error",
        description: "Failed to fix database schema",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="opacity-90 hover:opacity-100 transition-opacity border-yellow-500/50 bg-black/80">
      <CardHeader className="bg-yellow-800/20 border-b border-yellow-800/40">
        <CardTitle className="flex items-center text-yellow-300">
          <BugIcon className="mr-2 h-4 w-4" />
          Developer Debug Tools
          <Badge variant="outline" className="ml-2 text-xs bg-yellow-900/30">DEV ONLY</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 text-sm">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="showMessages" 
            checked={showAllMessages} 
            onCheckedChange={(checked) => setShowAllMessages(!!checked)} 
          />
          <label htmlFor="showMessages" className="text-xs">Show detailed response data</label>
        </div>
        
        {databaseError && (
          <div className="bg-red-900/30 border border-red-800/60 p-3 rounded text-red-200 flex">
            <AlertCircleIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Database Error Detected</div>
              <div className="text-xs">{databaseError}</div>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={fixDatabaseSchema}
                disabled={loading}
                className="mt-2 text-xs h-7 bg-red-800/50 hover:bg-red-700/50"
              >
                {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                Fix Database Schema
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fixDatabaseSchema}
            disabled={loading}
            className="flex items-center justify-center border-red-700/50 hover:border-red-500 mb-2"
          >
            {loading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <DatabaseIcon className="h-3 w-3 mr-2" />}
            Fix Database Schema
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={createTestFile}
            disabled={loading}
            className="flex items-center justify-center border-green-700/50 hover:border-green-500"
          >
            {loading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <DatabaseIcon className="h-3 w-3 mr-2" />}
            Create Test File
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={testFilesFetch}
            disabled={loading}
            className="flex items-center justify-center border-blue-700/50 hover:border-blue-500"
          >
            {loading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <DatabaseIcon className="h-3 w-3 mr-2" />}
            Test Files Fetch
          </Button>
        </div>
        
        {showAllMessages && (
          <Accordion type="single" collapsible className="w-full">
            {schemaFixResult && (
              <AccordionItem value="schemafix" className="border-yellow-800/20">
                <AccordionTrigger className="py-2 text-xs">Schema Fix Result</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-black/30 p-2 rounded overflow-auto text-xs max-h-40">
                    {JSON.stringify(schemaFixResult, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {testFileResult && (
              <AccordionItem value="testfile" className="border-yellow-800/20">
                <AccordionTrigger className="py-2 text-xs">Test File Result</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-black/30 p-2 rounded overflow-auto text-xs max-h-40">
                    {JSON.stringify(testFileResult, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {filesResult && (
              <AccordionItem value="filesresult" className="border-yellow-800/20">
                <AccordionTrigger className="py-2 text-xs">Files Fetch Result</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-black/30 p-2 rounded overflow-auto text-xs max-h-40">
                    {JSON.stringify(filesResult, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
} 