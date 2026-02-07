import { testDatabaseConnection, testInsertAsset } from '@/app/actions/test-db';
import { Button } from '@/components/ui/button';

export default async function TestDbPage() {
    const connectionTest = await testDatabaseConnection();

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>

            <div className="space-y-6">
                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
                    <div className={`p-4 rounded-lg ${connectionTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className="font-medium mb-2">
                            Status: {connectionTest.success ? '✅ Success' : '❌ Failed'}
                        </p>
                        <p className="text-sm mb-2">Message: {connectionTest.message}</p>
                        {connectionTest.success && (
                            <>
                                <p className="text-sm">Table Exists: {connectionTest.tableExists ? 'Yes' : 'No'}</p>
                                <p className="text-sm">Row Count: {connectionTest.rowCount}</p>
                            </>
                        )}
                        {connectionTest.error && (
                            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                                {connectionTest.error}
                            </pre>
                        )}
                        {connectionTest.data && connectionTest.data.length > 0 && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium">View Data</summary>
                                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                                    {JSON.stringify(connectionTest.data, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>

                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Insert Test</h2>
                    <form action={async () => {
                        'use server';
                        const result = await testInsertAsset();
                        console.log('Insert test result:', result);
                    }}>
                        <Button type="submit" className="mb-4">
                            Test Insert
                        </Button>
                    </form>
                    <p className="text-sm text-muted-foreground">
                        Click the button above to test inserting a record. Check browser console for results.
                    </p>
                </div>

                <div className="border rounded-lg p-6 bg-blue-50">
                    <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Check the connection test status above</li>
                        <li>If successful, try the insert test</li>
                        <li>Open browser console (F12) to see detailed logs</li>
                        <li>Check Vercel logs for server-side errors</li>
                    </ol>
                </div>

                <div>
                    <Button asChild variant="outline">
                        <a href="/">Back to Home</a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
