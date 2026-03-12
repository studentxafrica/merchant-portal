import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Upload,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    ArrowLeft,
    ArrowRight,
    Loader2,
    FileSpreadsheet,
    Sparkles,
    Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseCSV, downloadCSVTemplate } from '@/lib/csv-parser';
import { uploadCouponCSV } from '@/api/coupon-upload';
import { useUploadJob } from '@/hooks/use-upload-job';
import type { CsvParseResult, CsvValidationError } from '@/types/csv-upload';
import axiosInstance from '@/api/axios';

interface Offer {
    id: string;
    title: string;
    discountType: string;
    discountValue: number;
    currency: string;
    status: string;
    endDate: Date;
    coupons?: {
        total: number;
        claimed: number;
        redeemed: number;
    };
}

interface CsvUploadWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preselectedOfferId?: string;
    onComplete?: () => void;
    merchant: any;
}

const WIZARD_STEPS = [
    { id: 'select-offer', title: 'Select Offer', description: 'Choose which offer these coupons belong to' },
    { id: 'upload-csv', title: 'Upload CSV', description: 'Upload your coupon codes file' },
    { id: 'preview', title: 'Preview & Validate', description: 'Review parsed coupons before uploading' },
    { id: 'processing', title: 'Processing', description: 'Uploading and processing your coupons' },
];

export const CsvUploadWizard: React.FC<CsvUploadWizardProps> = ({
    open,
    onOpenChange,
    preselectedOfferId,
    onComplete,
    merchant,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [selectedOfferId, setSelectedOfferId] = useState<string>(preselectedOfferId || '');
    const [file, setFile] = useState<File | null>(null);
    const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadValidOnly, setUploadValidOnly] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { job, isPolling, error: pollError, startPolling } = useUploadJob();

    // Skip step 0 if offer is preselected
    const effectiveSteps = preselectedOfferId
        ? WIZARD_STEPS.slice(1)
        : WIZARD_STEPS;

    const effectiveStep = preselectedOfferId ? currentStep + 1 : currentStep;

    // Keep selected offer in sync when a preselected offer is provided/changes
    useEffect(() => {
        if (preselectedOfferId) {
            setSelectedOfferId(preselectedOfferId);
        }
    }, [preselectedOfferId]);

    // Fetch offers on mount
    useEffect(() => {
        if (open && !preselectedOfferId) {
            fetchOffers();
        }
    }, [open, preselectedOfferId]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setCurrentStep(0);
            setFile(null);
            setParseResult(null);
            setIsDragging(false);
            setIsParsing(false);
            setIsUploading(false);
            setUploadValidOnly(false);
            if (!preselectedOfferId) {
                setSelectedOfferId('');
            }
        }
    }, [open, preselectedOfferId]);

    const fetchOffers = async () => {
        try {
            const response = await axiosInstance.get('/user/merchant/offers');
            if (response.status === 200) {
                setOffers((response.data.data || []).filter((o: Offer) => o.status === 'active'));
            }
        } catch (err) {
            toast({
                title: 'Error loading offers',
                description: 'Could not load your active offers. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const selectedOffer = offers.find(o => o.id === selectedOfferId) || null;

    // File handling
    const handleFileDrop = useCallback(async (droppedFile: File) => {
        if (!droppedFile.name.endsWith('.csv')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload a CSV file (.csv)',
                variant: 'destructive',
            });
            return;
        }

        setFile(droppedFile);
        setIsParsing(true);

        try {
            const result = await parseCSV(droppedFile);
            setParseResult(result);

            if (result.errors.length === 0 && result.valid.length > 0) {
                toast({
                    title: 'CSV parsed successfully',
                    description: `Found ${result.valid.length} valid coupon codes.`,
                });
            } else if (result.valid.length > 0) {
                toast({
                    title: 'CSV parsed with warnings',
                    description: `${result.valid.length} valid, ${result.errors.length} errors found.`,
                    variant: 'warning',
                });
            } else {
                toast({
                    title: 'CSV parsing failed',
                    description: `No valid rows found. ${result.errors.length} errors detected.`,
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error parsing CSV',
                description: 'The file could not be parsed. Please check the format.',
                variant: 'destructive',
            });
        } finally {
            setIsParsing(false);
        }
    }, [toast]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileDrop(droppedFile);
        }
    }, [handleFileDrop]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileDrop(selectedFile);
        }
    }, [handleFileDrop]);

    // Upload
    const handleUpload = async () => {
        if (!file) {
            toast({
                title: 'Missing CSV file',
                description: 'Please upload a CSV file before continuing.',
                variant: 'destructive',
            });
            return;
        }
        if (!selectedOfferId) {
            toast({
                title: 'Missing offer selection',
                description: 'Please select an offer before uploading.',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadCouponCSV(file, selectedOfferId);
            setCurrentStep(preselectedOfferId ? 2 : 3);
            startPolling(result.job_id);
        } catch (err: any) {
            toast({
                title: 'Upload failed',
                description: err.response?.data?.message || 'Could not upload the CSV file. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Navigation
    const canGoNext = () => {
        switch (effectiveStep) {
            case 0: return !!selectedOfferId;
            case 1: return !!parseResult && parseResult.valid.length > 0;
            case 2: return !!parseResult && parseResult.valid.length > 0;
            default: return false;
        }
    };

    const handleNext = () => {
        if (effectiveStep === 2) {
            handleUpload();
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const isTerminal = job?.status === 'completed' || job?.status === 'failed';

    const progressPercent = job
        ? job.total_rows > 0 ? (job.processed_rows / job.total_rows) * 100 : 0
        : 0;

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (isPolling) return; // Prevent closing while processing
            onOpenChange(val);
        }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                        Import Coupon Codes
                    </DialogTitle>
                    <DialogDescription>
                        Upload your POS-generated coupon codes via CSV file
                    </DialogDescription>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="w-full mb-4">
                    <div className="flex justify-between mb-2">
                        {effectiveSteps.map((step, index) => {
                            const stepIndex = preselectedOfferId ? index + 1 : index;
                            const isActive = stepIndex === effectiveStep;
                            const isDone = stepIndex < effectiveStep;
                            return (
                                <div
                                    key={step.id}
                                    className={`flex flex-col items-center flex-1 ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${isActive
                                                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                                : isDone
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {isDone ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                    </div>
                                    <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                                </div>
                            );
                        })}
                    </div>
                    <Progress value={((currentStep + 1) / effectiveSteps.length) * 100} className="h-1" />
                </div>

                {/* Step 0: Select Offer */}
                {effectiveStep === 0 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select an active offer</label>
                            <Select value={selectedOfferId} onValueChange={setSelectedOfferId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an offer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {offers.map(offer => (
                                        <SelectItem key={offer.id} value={offer.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{offer.title}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `${offer.currency} ${offer.discountValue}`}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedOffer && (
                            <Card className="border-blue-200 bg-blue-50/50">
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Discount</span>
                                            <p className="font-medium">
                                                {selectedOffer.discountType === 'percentage'
                                                    ? `${selectedOffer.discountValue}% Off`
                                                    : `${selectedOffer.currency} ${selectedOffer.discountValue} Off`}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Expires</span>
                                            <p className="font-medium">{new Date(selectedOffer.endDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Existing Coupons</span>
                                            <p className="font-medium">{selectedOffer.coupons?.total || 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Status</span>
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                Active
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {offers.length === 0 && (
                            <Card className="border-yellow-200 bg-yellow-50/50">
                                <CardContent className="pt-4 text-center">
                                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                    <p className="text-sm text-yellow-800 font-medium">No active offers found</p>
                                    <p className="text-xs text-yellow-600 mt-1">
                                        Create an offer first before importing coupon codes.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Step 1: Upload CSV */}
                {effectiveStep === 1 && (
                    <div className="space-y-4">
                        {/* Drop zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging
                                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                                    : file
                                        ? 'border-green-300 bg-green-50/50'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileInput}
                            />

                            {isParsing ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                    <p className="text-sm text-gray-600">Parsing CSV file...</p>
                                </div>
                            ) : file ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(file.size / 1024).toFixed(1)} KB • Click or drop to replace
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                        <Upload className={`h-7 w-7 transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-700">
                                            {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            or click to browse • Max 5MB • .csv files only
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick validation summary */}
                        {parseResult && (
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-green-700">{parseResult.valid.length} valid</span>
                                </div>
                                {parseResult.errors.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-red-700">{parseResult.errors.length} errors</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <FileText className="h-4 w-4" />
                                    <span>{parseResult.total} total rows</span>
                                </div>
                            </div>
                        )}

                        {/* Download template */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-600">Need a template?</span>
                            <Button
                                variant="link"
                                size="sm"
                                className="text-blue-600 p-0 h-auto"
                                onClick={(e) => { e.stopPropagation(); downloadCSVTemplate(); }}
                            >
                                <Download className="h-3 w-3 mr-1" />
                                Download sample CSV
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview & Validate */}
                {effectiveStep === 2 && parseResult && (
                    <div className="space-y-4">
                        {/* Summary cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="bg-gray-50">
                                <CardContent className="pt-3 pb-3 text-center">
                                    <p className="text-2xl font-bold">{parseResult.total}</p>
                                    <p className="text-xs text-gray-500">Total Rows</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="pt-3 pb-3 text-center">
                                    <p className="text-2xl font-bold text-green-700">{parseResult.valid.length}</p>
                                    <p className="text-xs text-green-600">Valid</p>
                                </CardContent>
                            </Card>
                            <Card className={`${parseResult.errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <CardContent className="pt-3 pb-3 text-center">
                                    <p className={`text-2xl font-bold ${parseResult.errors.length > 0 ? 'text-red-700' : ''}`}>
                                        {parseResult.errors.length}
                                    </p>
                                    <p className={`text-xs ${parseResult.errors.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>Errors</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Error details */}
                        {parseResult.errors.length > 0 && (
                            <Card className="border-red-200">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="h-4 w-4" />
                                        Validation Errors
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        These rows will be skipped during upload
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-40 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs w-16">Row</TableHead>
                                                    <TableHead className="text-xs">Field</TableHead>
                                                    <TableHead className="text-xs">Error</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {parseResult.errors.map((err, i) => (
                                                    <TableRow key={i} className="text-xs">
                                                        <TableCell className="font-mono">{err.row_number}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-xs">{err.field}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-red-600">{err.message}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Valid rows preview */}
                        {parseResult.valid.length > 0 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Valid Coupons Preview
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Showing first {Math.min(parseResult.valid.length, 10)} of {parseResult.valid.length} valid coupons
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-48 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs">Coupon Code</TableHead>
                                                    <TableHead className="text-xs">Expiry Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {parseResult.valid.slice(0, 10).map((row, i) => (
                                                    <TableRow key={i} className="text-xs">
                                                        <TableCell className="font-mono">{row.coupon_code}</TableCell>
                                                        <TableCell>{new Date(row.expiry_date).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {parseResult.valid.length > 10 && (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center text-gray-400 text-xs">
                                                            +{parseResult.valid.length - 10} more rows
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Step 3: Processing */}
                {effectiveStep === 3 && (
                    <div className="space-y-6 py-4">
                        {/* Status */}
                        <div className="text-center">
                            {isPolling && !isTerminal ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Processing your coupons...</h3>
                                    <p className="text-sm text-gray-500 mt-1">This may take a moment for large files</p>
                                </>
                            ) : job?.status === 'completed' ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-800">Upload Complete!</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {job.successful_rows} of {job.total_rows} coupons processed successfully
                                    </p>
                                </>
                            ) : job?.status === 'failed' ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-red-800">Upload Failed</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        There was an error processing your file
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                        <Clock className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700">Uploading...</h3>
                                </>
                            )}
                        </div>

                        {/* Progress bar */}
                        {job && (
                            <div className="space-y-2">
                                <Progress value={progressPercent} className="h-2" />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{job.processed_rows} / {job.total_rows} processed</span>
                                    <span>{Math.round(progressPercent)}%</span>
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        {job && isTerminal && (
                            <div className="grid grid-cols-3 gap-3">
                                <Card className="bg-green-50 border-green-200">
                                    <CardContent className="pt-3 pb-3 text-center">
                                        <p className="text-xl font-bold text-green-700">{job.successful_rows}</p>
                                        <p className="text-xs text-green-600">Successful</p>
                                    </CardContent>
                                </Card>
                                <Card className={`${job.failed_rows > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                    <CardContent className="pt-3 pb-3 text-center">
                                        <p className={`text-xl font-bold ${job.failed_rows > 0 ? 'text-red-700' : ''}`}>
                                            {job.failed_rows}
                                        </p>
                                        <p className={`text-xs ${job.failed_rows > 0 ? 'text-red-600' : 'text-gray-500'}`}>Failed</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gray-50">
                                    <CardContent className="pt-3 pb-3 text-center">
                                        <p className="text-xl font-bold">{job.total_rows}</p>
                                        <p className="text-xs text-gray-500">Total</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Server-side errors */}
                        {job && job.errors && job.errors.length > 0 && isTerminal && (
                            <Card className="border-red-200">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="h-4 w-4" />
                                        Failed Rows
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-40 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs w-16">Row</TableHead>
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
                                </CardContent>
                            </Card>
                        )}

                        {pollError && (
                            <p className="text-sm text-red-600 text-center">{pollError}</p>
                        )}
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="flex justify-between pt-4 border-t">
                    <div>
                        {effectiveStep > 0 && effectiveStep < 3 && (
                            <Button variant="outline" onClick={handleBack} disabled={isUploading}>
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {isTerminal ? (
                            <Button
                                onClick={() => {
                                    onOpenChange(false);
                                    onComplete?.();
                                }}
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Done
                            </Button>
                        ) : effectiveStep < 3 ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isUploading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    disabled={!canGoNext() || isUploading}
                                    className='disabled:pointer-events-none'
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : effectiveStep === 2 ? (
                                        <Upload className="h-4 w-4 mr-1" />
                                    ) : (
                                        <ArrowRight className="h-4 w-4 mr-1" />
                                    )}
                                    {effectiveStep === 2
                                        ? (parseResult?.errors?.length ? `Upload ${parseResult.valid.length} Valid Coupons` : 'Upload Coupons')
                                        : 'Next'
                                    }
                                </Button>
                            </>
                        ) : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
