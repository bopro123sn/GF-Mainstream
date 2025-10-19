import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InputCard from './components/InputCard';
import FeedStageCard from './components/FeedStageCard';
import ResultsCard from './components/ResultsCard';
import { CalculatorIcon } from './components/Icons';
import { Stage, CalculationParams, Result, FeedProgramDetail, Feed } from './types';
import { INITIAL_STAGES, BAG_WEIGHT } from './constants';
import { GoogleGenAI } from '@google/genai';
import { programs } from './programs';


const App: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [params, setParams] = useState<CalculationParams>({
    herdSize: 100,
    startWeight: 7,
    mortalityRate: 3,
    sellingPricePerKg: 60000,
    startDate: new Date().toISOString().split('T')[0],
    geneticPrice: 1500000,
    medicineCost: 150000,
    managementCost: 150000,
    finalWeight: 100,
    daysToMarket: 150,
    geneticType: '3-way',
  });
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [insights, setInsights] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  
  const [selectedProgram, setSelectedProgram] = useState<string>('custom');


  const handleStageChange = (updatedStage: Stage) => {
    setStages(stages.map(s => s.name === updatedStage.name ? updatedStage : s));
    setSelectedProgram('custom');
  };
  
  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const programName = e.target.value;
    setSelectedProgram(programName);

    if (programName !== 'custom') {
        const programData = programs.find(p => p.name === programName);
        if (programData) {
            // Deep copy to prevent mutation of the constant
            const newStages = JSON.parse(JSON.stringify(programData.stages));
            setStages(newStages);
        }
    }
  };

  const fetchGeminiInsights = async (resultData: Result, paramsData: CalculationParams) => {
    setIsInsightsLoading(true);
    setInsights(null);
    setInsightsError(null);

    if (!process.env.API_KEY) {
        setInsightsError("API key is not configured. AI insights are unavailable.");
        setIsInsightsLoading(false);
        return;
    }
    
    try {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
        const prompt = `
Bạn là một chuyên gia phân tích trang trại chăn nuôi heo, đưa ra những nhận định ngắn gọn, sâu sắc và dễ hiểu bằng tiếng Việt cho người nông dân.
Dựa vào các dữ liệu phân tích hiệu quả chăn nuôi dưới đây, hãy đưa ra một đoạn nhận xét và khuyến nghị ngắn gọn (khoảng 2-4 câu) bằng tiếng Việt. Tập trung vào các điểm mạnh (ví dụ: FCR tốt, tăng trọng cao) và các rủi ro tiềm ẩn (ví dụ: lợi nhuận nhạy cảm với giá bán, chi phí thức ăn cao).

**Dữ liệu đầu vào:**
- Quy mô đàn: ${paramsData.herdSize} con
- Loại heo: ${paramsData.geneticType === '2-way' ? 'Heo 2 máu' : 'Heo 3 máu'}
- Giá bán dự kiến: ${paramsData.sellingPricePerKg.toLocaleString('vi-VN')} đ/kg
- Chi phí con giống: ${paramsData.geneticPrice.toLocaleString('vi-VN')} đ/con

**Kết quả chính:**
- Lợi nhuận kỳ vọng / con: ${resultData.profitPerPig.toLocaleString('vi-VN')} VNĐ
- Tỷ lệ chuyển đổi thức ăn (FCR): ${resultData.averageFCR.toFixed(2)}
- Tăng trọng trung bình ngày (ADG): ${resultData.averageADG.toFixed(0)} g/ngày
- Số ngày nuôi: ${resultData.daysToMarket} ngày
- Cân nặng xuất chuồng: ${resultData.finalWeight.toFixed(1)} kg
- Chi phí thức ăn / kg tăng trọng: ${resultData.feedCostPerKgGain.toLocaleString('vi-VN')} VNĐ
- Tổng chi phí / kg tăng trọng: ${resultData.totalCostPerKgGain.toLocaleString('vi-VN')} VNĐ

**Kịch bản lợi nhuận (Toàn đàn):**
- Bi quan (giá bán giảm 5%): Lợi nhuận ${resultData.profitScenarios[0].profit.toLocaleString('vi-VN')} VNĐ
- Kỳ vọng: Lợi nhuận ${resultData.profitScenarios[1].profit.toLocaleString('vi-VN')} VNĐ
- Lạc quan (giá bán tăng 5%): Lợi nhuận ${resultData.profitScenarios[2].profit.toLocaleString('vi-VN')} VNĐ

Hãy đưa ra nhận xét theo văn phong chuyên gia nhưng thân thiện. Ví dụ: "Chương trình này cho FCR đạt ${resultData.averageFCR.toFixed(2)}, là một kết quả rất tốt. Tuy nhiên, lợi nhuận khá nhạy cảm với giá bán; giá giảm 5% có thể làm giảm tổng lợi nhuận đáng kể. Cân nhắc các phương án ổn định giá bán đầu ra."
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setInsights(response.text);

    } catch (e: any) {
        console.error("Gemini API error:", e);
        setInsightsError("Không thể tải phân tích từ AI. Vui lòng thử lại.");
    } finally {
        setIsInsightsLoading(false);
    }
};
  
  const handleCalculate = () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setInsights(null);
    setInsightsError(null);
    
    setTimeout(() => {
      try {
        // Sanitize params before calculation
        const p = {
            ...params,
            startWeight: parseFloat(String(params.startWeight)) || 0,
            mortalityRate: parseFloat(String(params.mortalityRate)) || 0,
            finalWeight: parseFloat(String(params.finalWeight)) || 0,
            daysToMarket: parseInt(String(params.daysToMarket)) || 0,
        };

        if (p.daysToMarket <= 0) {
            throw new Error("Số ngày nuôi phải lớn hơn 0.");
        }
        if (p.finalWeight <= p.startWeight) {
            throw new Error("Cân nặng xuất chuồng phải lớn hơn cân nặng bắt đầu.");
        }


        const sanitizedStages = stages.map(stage => ({
            ...stage,
            feeds: stage.feeds.map(feed => ({
                ...feed,
                bagsConsumed: parseFloat(String(feed.bagsConsumed)) || 0,
            }))
        }));

        const totalBagsConsumedPerPig = sanitizedStages.reduce((totalBags, stage) => 
            totalBags + stage.feeds.reduce((stageBags, feed) => stageBags + feed.bagsConsumed, 0), 0);

        if (totalBagsConsumedPerPig <= 0) {
            throw new Error("Vui lòng nhập số bao tiêu thụ để thực hiện tính toán.");
        }
        
        const totalFeedConsumedKgPerPig = totalBagsConsumedPerPig * BAG_WEIGHT;
        const totalWeightGain = p.finalWeight - p.startWeight;
        const daysToMarket = p.daysToMarket;

        const averageFCR = totalWeightGain > 0 ? totalFeedConsumedKgPerPig / totalWeightGain : 0;
        const averageADG = totalWeightGain > 0 && daysToMarket > 0 ? (totalWeightGain / daysToMarket) * 1000 : 0; // in grams
        const averageDailyFeedIntake = daysToMarket > 0 ? totalFeedConsumedKgPerPig / daysToMarket : 0; // in kg

        const feedProgramDetails: FeedProgramDetail[] = sanitizedStages.flatMap(stage => 
            stage.feeds.map(feed => ({
                stageName: stage.name,
                productCode: feed.productCode,
                bagsConsumed: feed.bagsConsumed,
                totalKg: feed.bagsConsumed * BAG_WEIGHT,
                pricePerBag: feed.pricePerBag,
                totalCost: feed.bagsConsumed * feed.pricePerBag,
            }))
        );
        
        const pigsSold = p.herdSize * (1 - p.mortalityRate / 100);
        
        // Costs
        const feedCostPerPig = feedProgramDetails.reduce((sum, item) => sum + item.totalCost, 0);
        const totalFeedCost = feedCostPerPig * p.herdSize;
        const totalGeneticCost = p.geneticPrice * p.herdSize;
        const totalMedicineCost = p.medicineCost * p.herdSize;
        const totalManagementCost = p.managementCost * p.herdSize;
        const totalCost = totalFeedCost + totalGeneticCost + totalMedicineCost + totalManagementCost;

        const costBreakdown = {
            genetic: totalGeneticCost,
            feed: totalFeedCost,
            medicine: totalMedicineCost,
            management: totalManagementCost,
        };
        
        const totalPigWeightGain = pigsSold * totalWeightGain;
        
        // NEW CALCULATION for totalCostPerKgGain as per user request
        const costPerPig = p.geneticPrice + feedCostPerPig + p.medicineCost + p.managementCost;
        const totalCostPerKgGain = p.finalWeight > 0 ? costPerPig / p.finalWeight : 0;
        
        const feedCostPerKgGain = totalPigWeightGain > 0 ? totalFeedCost / totalPigWeightGain : 0;
        
        // Revenue & Profit
        const calculateProfit = (price: number) => {
            const revenue = pigsSold * p.finalWeight * price;
            return { revenue, profit: revenue - totalCost };
        };
        
        const pricePessimistic = p.sellingPricePerKg * 0.95;
        const priceOptimistic = p.sellingPricePerKg * 1.05;

        const scenarios = [
            { name: 'Bi quan', price: pricePessimistic },
            { name: 'Kỳ vọng', price: p.sellingPricePerKg },
            { name: 'Lạc quan', price: priceOptimistic },
        ];
        
        const profitScenarios = scenarios.map(s => {
            const scenarioResult = calculateProfit(s.price);
            return {
                name: s.name,
                sellingPrice: s.price,
                revenue: scenarioResult.revenue,
                profit: scenarioResult.profit,
            };
        });

        const baseScenario = profitScenarios[1]; // Ky vong is the base
        const profitPerPig = p.herdSize > 0 ? baseScenario.profit / p.herdSize : 0;
        
        const startDateObj = new Date(p.startDate);
        const sellingDateObj = new Date(startDateObj.getTime());
        sellingDateObj.setDate(sellingDateObj.getDate() + daysToMarket);
        const sellingDate = sellingDateObj.toISOString().split('T')[0];
        
        const newResult: Result = {
            profitPerPig,
            totalCostPerKgGain,
            feedCostPerKgGain,
            averageFCR,
            averageADG,
            averageDailyFeedIntake,
            daysToMarket,
            startDate: p.startDate,
            sellingDate,
            profitScenarios,
            costBreakdown,
            totalCost,
            finalWeight: p.finalWeight,
            totalWeightGain,
            feedProgram: feedProgramDetails,
            totalRevenue: baseScenario.revenue,
            pigsSold,
        };

        setResult(newResult);
        fetchGeminiInsights(newResult, params);

      } catch (e: any) {
          setError(e.message || "Đã xảy ra lỗi không xác định trong quá trình tính toán.");
      } finally {
          setIsLoading(false);
      }
    }, 500);
  };


  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="space-y-8">
          <InputCard params={params} onParamsChange={setParams} />

          <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Chương Trình Khuyến Nghị</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Chọn một chương trình dinh dưỡng có sẵn để tự động điền thông tin bên dưới, hoặc chọn "Tùy chỉnh" để tự nhập liệu.
            </p>
            <div className="max-w-md">
              <label htmlFor="program-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Chương trình
              </label>
              <select
                id="program-select"
                name="program"
                value={selectedProgram}
                onChange={handleProgramChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#00973E] focus:border-[#00973E] sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="custom">Tùy chỉnh</option>
                {programs.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Chương trình Dinh dưỡng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stages.map(stage => (
                <FeedStageCard key={stage.name} stage={stage} onStageChange={handleStageChange} />
              ))}
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="bg-[#00973E] hover:bg-[#00652B] text-white font-bold py-3 px-10 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto dark:disabled:bg-slate-600"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              {isLoading ? 'Đang tính toán...' : 'Tính toán & Xem kết quả'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative dark:bg-red-900/50 dark:border-red-500 dark:text-red-300" role="alert">
              <strong className="font-bold">Lỗi!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          <ResultsCard 
            result={result} 
            isLoading={isLoading} 
            params={params} 
            insights={insights}
            isInsightsLoading={isInsightsLoading}
            insightsError={insightsError}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;