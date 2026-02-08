import { getGroupedAssets } from '@/app/actions/assets';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AssetGrid } from '@/components/assets/asset-grid';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/auth/user-menu';

export default async function AssetsPage() {
    const { data: groups } = await getGroupedAssets();

    return (
        <div className="container py-8 mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
                            <a href="/">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Studio
                            </a>
                        </Button>
                    </div>
                    <h1 className="font-serif text-3xl font-bold">Asset Gallery</h1>
                    <p className="text-muted-foreground mt-1">
                        Your history of generated images and posts
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <ModeToggle />
                    <UserMenu />
                </div>
            </div>

            <AssetGrid groups={groups || []} />
        </div>
    );
}
