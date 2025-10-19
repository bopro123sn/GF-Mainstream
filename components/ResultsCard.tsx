import React from 'react';
import { Result, CalculationParams } from '../types';
import { ShareIcon, PDFIcon, ExcelIcon, InfoIcon, CalendarIcon, LightbulbIcon } from './Icons';
import { cargillColors } from '../cargillAssets';
import * as XLSX from 'xlsx';

// Helper to format numbers with commas
const formatNumber = (value: number, decimals = 2): string => {
    if (isNaN(value) || value === null) return 'N/A';
    return value.toLocaleString('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

// Helper to format currency
const formatCurrency = (value: number): string => {
    if (isNaN(value) || value === null) return '0 VNĐ';
    return `${formatNumber(value, 0)} VNĐ`;
};


const StatCard: React.FC<{ label: string; value: string; unit: string; tooltip?: string; highlighted?: boolean }> = ({ label, value, unit, tooltip, highlighted = false }) => (
    <div className={`p-4 rounded-lg shadow-sm ${highlighted ? 'bg-green-50 dark:bg-green-500/10' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 group relative">
             <p>{label}</p>
             {tooltip && (
                <>
                    <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <span className="font-semibold block">Công thức:</span>
                        {tooltip}
                    </div>
                </>
             )}
        </div>
        <div className="flex items-baseline mt-1">
            <p className={`text-3xl font-bold ${highlighted ? 'text-[#00973E]' : 'text-gray-800 dark:text-gray-100'}`}>{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">{unit}</p>
        </div>
    </div>
);

interface ResultsCardProps {
    result: Result | null;
    isLoading: boolean;
    params: CalculationParams;
    insights: string | null;
    isInsightsLoading: boolean;
    insightsError: string | null;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ result, isLoading, params, insights, isInsightsLoading, insightsError }) => {
    const handleExportExcel = () => {
        if (!result) return;

        // 1. Input Parameters
        const paramsData = [
            ["Thông số Đầu vào & Mục tiêu"],
            ["Quy mô đàn (con)", params.herdSize],
            ["trọng lượng heo con bắt đầu (kg)", params.startWeight],
            ["Cân nặng xuất chuồng (kg)", params.finalWeight],
            ["Số ngày nuôi", params.daysToMarket],
            ["Tỷ lệ hao hụt (%)", params.mortalityRate],
            ["Giá bán dự kiến (đ/kg)", params.sellingPricePerKg],
            ["Ngày bắt đầu nuôi", params.startDate],
            ["Chi phí con giống (đ/con)", params.geneticPrice],
            ["Chi phí thú y (đ/con)", params.medicineCost],
            ["Chi phí quản lý khác (đ/con)", params.managementCost],
        ];

        // 2. Key Metrics
        const metricsData = [
            ["Kết quả Phân tích Hiệu quả"],
            ["Lợi nhuận/con (VNĐ)", result.profitPerPig],
            ["Chi phí thức ăn/kg tăng trọng (VNĐ)", result.feedCostPerKgGain],
            ["Tổng chi phí/kg tăng trọng (VNĐ)", result.totalCostPerKgGain],
            ["Tỷ lệ chuyển đổi thức ăn (FCR)", result.averageFCR],
            ["Trung bình tăng trọng ngày (g/ngày)", result.averageADG],
            ["Trung bình lượng ăn hàng ngày (kg/ngày)", result.averageDailyFeedIntake],
            ["Số ngày nuôi", result.daysToMarket],
            ["Cân nặng xuất chuồng (kg)", result.finalWeight],
            ["Tổng tăng trọng / con (kg)", result.totalWeightGain],
        ];
        
        // 3. Feed Program
        const feedProgramHeader = ["Giai đoạn", "Mã sản phẩm", "Số bao/con", "Tổng kg/con", "Đơn giá/bao (VNĐ)", "Tổng CP/con (VNĐ)"];
        const feedProgramRows = result.feedProgram.map(item => [
            item.stageName,
            item.productCode,
            item.bagsConsumed,
            item.totalKg,
            item.pricePerBag,
            item.totalCost,
        ]);
        const feedProgramTotal = ["Tổng", "", "", "", "", result.feedProgram.reduce((sum, item) => sum + item.totalCost, 0)];
        const feedProgramData = [
            ["Chi tiết Chương trình Dinh dưỡng"],
            feedProgramHeader,
            ...feedProgramRows,
            feedProgramTotal
        ];

        // 4. Profit Scenarios
        const profitHeader = ["Kịch bản", "Giá bán (VNĐ)", "Doanh thu (VNĐ)", "Lợi nhuận (VNĐ)"];
        const profitRows = result.profitScenarios.map(s => [s.name, s.sellingPrice, s.revenue, s.profit]);
        const profitData = [
            ["Kịch bản Lợi nhuận (Toàn đàn)"],
            profitHeader,
            ...profitRows
        ];

        // Combine all data with spacers
        const finalData = [
            ["Báo cáo Phân tích Hiệu quả Chăn nuôi"],
            [],
            ...paramsData,
            [],
            ...metricsData,
            [],
            ...feedProgramData,
            [],
            ...profitData,
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(finalData);

        // Auto-fit columns for better readability
        const maxCols = finalData.reduce((max, row) => Math.max(max, row.length), 0);
        const colWidths = Array(maxCols).fill(0).map(() => ({ wch: 10 })); // Default width

        finalData.forEach(row => {
            row.forEach((cell, i) => {
                const cellValue = cell ? String(cell) : '';
                const len = cellValue.length;
                if (colWidths[i].wch < len) {
                    colWidths[i].wch = len;
                }
            });
        });
        colWidths.forEach(col => col.wch += 2); // Add a little padding
        worksheet['!cols'] = colWidths;
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoChanNuoi");
        
        XLSX.writeFile(workbook, "BaoCaoChanNuoi.xlsx");
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00973E]"></div>
                    <p className="ml-4 text-gray-600 dark:text-gray-300">Đang xử lý dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Kết quả Phân tích</h2>
                <p className="text-gray-500 dark:text-gray-400 py-10">Vui lòng nhập thông số và nhấn "Tính toán" để xem kết quả chi tiết.</p>
            </div>
        );
    }

    return (
        <div id="results-section" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg space-y-10 print:shadow-none">
            {/* Header */}
            <div className="flex justify-between items-center print:hidden">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Kết quả Phân tích</h2>
                <div>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center bg-white border border-green-700 text-green-700 hover:bg-green-50 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 dark:bg-slate-700 dark:border-green-600 dark:text-green-400 dark:hover:bg-slate-600"
                        aria-label="Export to Excel"
                    >
                        <ExcelIcon className="h-5 w-5 mr-2" />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Báo cáo Phân tích Hiệu quả Chăn nuôi</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            {/* AI Insights Section */}
            {(isInsightsLoading || insights || insightsError) && (
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/50 dark:border-blue-700">
                    <div className="flex items-center mb-2">
                        <LightbulbIcon className="h-6 w-6 text-blue-500 mr-3" />
                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Phân tích & Khuyến nghị từ AI</h3>
                    </div>
                    {isInsightsLoading && <p className="text-gray-600 dark:text-gray-300 animate-pulse">AI đang phân tích kết quả...</p>}
                    {insightsError && <p className="text-red-600 dark:text-red-400">{insightsError}</p>}
                    {insights && !isInsightsLoading && (
                        <blockquote className="text-gray-700 dark:text-gray-300 italic border-l-4 border-blue-300 dark:border-blue-600 pl-4">
                            {insights}
                        </blockquote>
                    )}
                </div>
            )}

            {/* Key Metrics Dashboard */}
            <div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Kết quả Phân tích Hiệu quả Chăn nuôi</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Dựa trên các thông số đầu vào và chương trình dinh dưỡng.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <StatCard label="Lợi nhuận/con" value={formatNumber(result.profitPerPig, 0)} unit="VNĐ" highlighted tooltip="Lợi nhuận kịch bản kỳ vọng / Quy mô đàn" />
                    <StatCard label="Chi phí thức ăn/kg tăng trọng" value={formatNumber(result.feedCostPerKgGain, 0)} unit="VNĐ" tooltip="Tổng chi phí thức ăn / Tổng tăng trọng toàn đàn" />
                    <StatCard label="Tỷ lệ chuyển đổi thức ăn" value={formatNumber(result.averageFCR, 2)} unit="(FCR)" tooltip="Tổng lượng thức ăn tiêu thụ (kg) / Tổng tăng trọng (kg)" />
                    <StatCard label="Trung bình tăng trọng ngày" value={formatNumber(result.averageADG, 0)} unit="g/ngày (ADG)" tooltip="(Cân nặng xuất chuồng - Cân nặng bắt đầu) / Số ngày nuôi * 1000" />
                    <StatCard label="Trung bình lượng ăn hàng ngày" value={formatNumber(result.averageDailyFeedIntake, 2)} unit="kg/ngày (ADFI)" tooltip="Tổng lượng thức ăn tiêu thụ (kg) / Số ngày nuôi" />
                    <StatCard label="Số ngày nuôi" value={formatNumber(result.daysToMarket, 0)} unit="ngày" tooltip="Mục tiêu số ngày nuôi" />
                </div>
            </div>
            
            {/* Schedule */}
             <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 text-center">Lịch trình Sản xuất</h3>
                <div className="flex items-center justify-center space-x-4 text-center">
                    <div className="flex flex-col items-center">
                        <CalendarIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mb-1" />
                        <p className="font-semibold dark:text-white">{new Date(result.startDate).toLocaleDateString('vi-VN')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ngày bắt đầu</p>
                    </div>
                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500 font-sans text-2xl pt-2">
                        <span>&rarr;</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{result.daysToMarket} ngày</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <CalendarIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 mb-1" />
                        <p className="font-semibold dark:text-white">{new Date(result.sellingDate).toLocaleDateString('vi-VN')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ngày xuất bán</p>
                    </div>
                </div>
            </div>

            {/* Performance Details */}
            <div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Chi tiết Hiệu suất</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                     <StatCard label="Cân nặng xuất chuồng" value={formatNumber(result.finalWeight, 1)} unit="kg" tooltip="Mục tiêu cân nặng xuất chuồng." />
                     <StatCard label="Tổng tăng trọng / con" value={formatNumber(result.totalWeightGain, 1)} unit="kg" tooltip="Cân nặng xuất chuồng - Cân nặng bắt đầu" />
                     <StatCard label="Tổng chi phí/kg tăng trọng" value={formatNumber(result.totalCostPerKgGain, 0)} unit="VNĐ" tooltip="Chi phí trên mỗi con (Giống + Thức ăn + Thú y + Quản lý) / Cân nặng xuất chuồng" />
                </div>
            </div>

            {/* Financial Analysis */}
            <div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Phân tích Tài chính (Toàn đàn)</h3>
                <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-lg">
                    <div className="flex justify-between items-center pb-4 border-b group relative">
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                            Tổng Doanh thu (Kỳ vọng)
                            <InfoIcon className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500 cursor-help" />
                        </p>
                         <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <span className="font-semibold block">Công thức:</span>
                            Số heo bán được * Cân nặng xuất chuồng * Giá bán kỳ vọng
                        </div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(result.totalRevenue)}</p>
                    </div>
                    <div className="pt-4 space-y-3">
                        <div className="flex justify-between items-baseline">
                            <p className="text-md text-gray-700 dark:text-gray-300">Chi phí Giống</p>
                            <div className="text-right">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(result.costBreakdown.genetic)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">({formatCurrency(params.geneticPrice)} / con)</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <p className="text-md text-gray-700 dark:text-gray-300">Chi phí Thức ăn</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(result.costBreakdown.feed)}</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <p className="text-md text-gray-700 dark:text-gray-300">Chi phí Thú y</p>
                             <div className="text-right">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(result.costBreakdown.medicine)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">({formatCurrency(params.medicineCost)} / con)</p>
                            </div>
                        </div>
                         <div className="flex justify-between items-baseline">
                            <p className="text-md text-gray-700 dark:text-gray-300">Chi phí Quản lý</p>
                             <div className="text-right">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(result.costBreakdown.management)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">({formatCurrency(params.managementCost)} / con)</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t mt-4 group relative">
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center">
                            Tổng Chi phí
                            <InfoIcon className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500 cursor-help" />
                        </p>
                        <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <span className="font-semibold block">Công thức:</span>
                            Tổng CP Giống + CP Thức ăn + CP Thú y + CP Quản lý
                        </div>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(result.totalCost)}</p>
                    </div>
                </div>
            </div>
            
            {/* Profit Scenarios */}
            <div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Kịch bản Lợi nhuận (Toàn đàn)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {result.profitScenarios.map((scenario) => (
                        <div key={scenario.name} className={`p-5 rounded-lg shadow-sm ${scenario.name === 'Kỳ vọng' ? 'bg-blue-50 border-blue-200 border dark:bg-blue-900/50 dark:border-blue-700' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{scenario.name}</h4>
                                <div className="group relative">
                                    <InfoIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                         <span className="font-semibold block">Công thức:</span>
                                         Lợi nhuận = Doanh thu - Tổng chi phí
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">(Giá bán: {formatCurrency(scenario.sellingPrice)})</p>
                            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex justify-between"><span>Doanh thu:</span> <span className="font-medium dark:text-gray-200">{formatCurrency(scenario.revenue)}</span></div>
                                <div className="flex justify-between"><span>Tổng chi phí:</span> <span className="font-medium dark:text-gray-200">- {formatCurrency(result.totalCost)}</span></div>
                                <hr className="my-1 dark:border-gray-600"/>
                                <div className="flex justify-between text-base">
                                    <span className="font-semibold">Lợi nhuận:</span> 
                                    <span className={`font-bold ${scenario.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(scenario.profit)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
             {/* Feed Program Details */}
             <div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Chi tiết Chương trình Dinh dưỡng</h3>
                <div className="overflow-x-auto rounded-lg border dark:border-slate-700">
                   <table className="min-w-full bg-white dark:bg-slate-800">
                     <thead className="bg-gray-50 dark:bg-slate-700/50">
                       <tr>
                         <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Giai đoạn</th>
                         <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Mã sản phẩm</th>
                         <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Số bao/con</th>
                         <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tổng kg/con</th>
                         <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Đơn giá/bao</th>
                         <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tổng CP/con</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                       {result.feedProgram.map((item, index) => (
                         <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                           <td className="py-3 px-4">{item.stageName}</td>
                           <td className="py-3 px-4">{item.productCode}</td>
                           <td className="py-3 px-4 text-right">{formatNumber(item.bagsConsumed, 1)}</td>
                           <td className="py-3 px-4 text-right">{formatNumber(item.totalKg, 1)}</td>
                           <td className="py-3 px-4 text-right">{formatCurrency(item.pricePerBag)}</td>
                           <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.totalCost)}</td>
                         </tr>
                       ))}
                     </tbody>
                      <tfoot className="font-bold bg-gray-100 dark:bg-slate-700">
                           <tr>
                               <td colSpan={5} className="py-3 px-4 text-right text-base text-gray-700 dark:text-gray-200">Tổng chi phí thức ăn / con</td>
                               <td className="py-3 px-4 text-right text-base text-gray-800 dark:text-gray-100">{formatCurrency(result.feedProgram.reduce((sum, item) => sum + item.totalCost, 0))}</td>
                           </tr>
                       </tfoot>
                   </table>
                 </div>
             </div>

        </div>
    );
};

export default ResultsCard;