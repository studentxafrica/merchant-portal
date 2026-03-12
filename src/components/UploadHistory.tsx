import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    ChevronDown,
    FileSpreadsheet,
    AlertTriangle,
} from 'lucide-react';
import { getUploadHistory } from '@/api/coupon-upload';
import { useToast } from '@/hooks/use-toast';
import type { CouponUploadJob } from '@/types/csv-upload';

interface UploadHistoryProps {
    merchant: any;
    refreshTrigger?: number; // Increment to trigger a refresh
}

export const UploadHistory: React.FC<UploadHistoryProps> = ({ merchant, refreshTrigger }) => {
    const [jobs, setJobs] = useState<CouponUploadJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedJob, setExpandedJob] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (merchant) {
            fetchHistory();
        }
    }, [merchant, refreshTrigger]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await getUploadHistory();
            setJobs(data || []);
        } catch (err: any) {
            if (err.response?.status !== 404) {
                toast({
                    title: 'Error loading upload history',
                    description: err.response?.data?.message || 'Could not load upload history.',
                    variant: 'destructive',
                });
            }
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
            case 'processing':
                return (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading upload history...</p>
                </CardContent>
            </Card>
        );
    }

    if (jobs.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <FileSpreadsheet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-600">No uploads yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Your CSV upload history will appear here
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    Upload History
                </CardTitle>
                <CardDescription>Past CSV coupon uploads and their results</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {jobs.map(job => (
                        <Collapsible
                            key={job.id}
                            open={expandedJob === job.id}
                            onOpenChange={(open) => setExpandedJob(open ? job.id : null)}
                        >
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {job.offer?.title || `Offer ${job.offer_id.substring(0, 8)}...`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(job.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right text-xs text-gray-500 hidden sm:block">
                                            <span className="text-green-600 font-medium">{job.successful_rows}</span>
                                            <span> / {job.total_rows}</span>
                                            {job.failed_rows > 0 && (
                                                <span className="text-red-500 ml-1">({job.failed_rows} failed)</span>
                                            )}
                                        </div>
                                        {getStatusBadge(job.status)}
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedJob === job.id ? 'rotate-180' : ''
                                            }`} />
                                    </div>
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <div className="px-3 pb-3 pt-1">
                                    {/* Stats */}
                                    <div className="grid grid-cols-4 gap-2 mb-3">
                                        <div className="bg-gray-50 rounded p-2 text-center">
                                            <p className="text-lg font-bold">{job.total_rows}</p>
                                            <p className="text-xs text-gray-500">Total</p>
                                        </div>
                                        <div className="bg-blue-50 rounded p-2 text-center">
                                            <p className="text-lg font-bold text-blue-700">{job.processed_rows}</p>
                                            <p className="text-xs text-blue-600">Processed</p>
                                        </div>
                                        <div className="bg-green-50 rounded p-2 text-center">
                                            <p className="text-lg font-bold text-green-700">{job.successful_rows}</p>
                                            <p className="text-xs text-green-600">Successful</p>
                                        </div>
                                        <div className={`${job.failed_rows > 0 ? 'bg-red-50' : 'bg-gray-50'} rounded p-2 text-center`}>
                                            <p className={`text-lg font-bold ${job.failed_rows > 0 ? 'text-red-700' : ''}`}>
                                                {job.failed_rows}
                                            </p>
                                            <p className={`text-xs ${job.failed_rows > 0 ? 'text-red-600' : 'text-gray-500'}`}>Failed</p>
                                        </div>
                                    </div>

                                    {/* Error details */}
                                    {job.errors && job.errors.length > 0 && (
                                        <div className="border border-red-200 rounded-lg overflow-hidden">
                                            <div className="bg-red-50 px-3 py-2 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                <span className="text-xs font-medium text-red-700">
                                                    {job.errors.length} failed row{job.errors.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="max-h-40 overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="text-xs w-14">Row</TableHead>
                                                            <TableHead className="text-xs">Code</TableHead>
                                                            <TableHead className="text-xs">Reason</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {job.errors.map((err, i) => (
                                                            <TableRow key={i} className="text-xs">
                                                                <TableCell className="font-mono">{err.row}</TableCell>
                                                                <TableCell className="font-mono">{err.coupon_code}</TableCell>
                                                                <TableCell className="text-red-600">{err.reason}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}

                                    {job.completed_at && (
                                        <p className="text-xs text-gray-400 mt-2 text-right">
                                            Completed {new Date(job.completed_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
