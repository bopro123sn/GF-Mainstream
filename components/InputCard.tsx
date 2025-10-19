import React from 'react';
import { CalculationParams } from '../types';
import { PigIcon, InfoIcon } from './Icons';

interface InputCardProps {
  params: CalculationParams;
  onParamsChange: (newParams: CalculationParams) => void;
}

const formatNumberInput = (value: string | number): string => {
    if (value === '' || value === null || value === undefined) return '';
    const numStr = String(value).replace(/,/g, '');
    if (numStr === '') return '';
    const parts = numStr.split('.');
    if (isNaN(Number(parts[0].replace(/,/g, '')))) return '';
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
};

const parseNumberInput = (value: string): number => {
    return parseFloat(value.replace(/,/g, '')) || 0;
};


const InputCard: React.FC<InputCardProps> = ({ params, onParamsChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'sellingPricePerKg' || name === 'geneticPrice' || name === 'medicineCost' || name === 'managementCost') {
        onParamsChange({
            ...params,
            [name]: parseNumberInput(value),
        });
    } else if (['startWeight', 'mortalityRate', 'finalWeight'].includes(name)) {
        // Allow only valid decimal number patterns
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
            onParamsChange({
                ...params,
                [name]: value,
            });
        }
    } else {
        onParamsChange({
          ...params,
          [name]: type === 'number' ? parseFloat(value) || 0 : value,
        });
    }
  };

  const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00973E] focus:border-transparent dark:bg-slate-700 dark:border-slate-600";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800">
      <div className="flex items-center mb-4">
        <PigIcon className="h-8 w-8 text-[#00973E] mr-3" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Thông số Đầu vào</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Herd Size */}
        <div className="flex flex-col">
          <div className="flex items-center mb-1 group relative">
            <label htmlFor="herdSize" className="font-semibold text-gray-600 dark:text-gray-300">Quy mô đàn (con)</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Tổng số heo bắt đầu nuôi. Dùng để tính toán tổng chi phí, doanh thu và lợi nhuận toàn đàn.
            </div>
          </div>
          <input
            type="number"
            id="herdSize"
            name="herdSize"
            value={params.herdSize}
            onChange={handleChange}
            className={inputClasses}
            min="1"
          />
        </div>

        {/* Start Weight */}
        <div className="flex flex-col">
           <div className="flex items-center mb-1 group relative">
            <label htmlFor="startWeight" className="font-semibold text-gray-600 dark:text-gray-300">Trọng lượng heo con bắt đầu (kg)</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Cân nặng trung bình của heo khi bắt đầu chương trình dinh dưỡng. Đây là điểm khởi đầu cho mọi tính toán tăng trọng.
            </div>
          </div>
          <input
            type="text"
            inputMode="decimal"
            id="startWeight"
            name="startWeight"
            value={params.startWeight}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Mortality Rate */}
        <div className="flex flex-col">
          <div className="flex items-center mb-1 group relative">
            <label htmlFor="mortalityRate" className="font-semibold text-gray-600 dark:text-gray-300">Tỷ lệ hao hụt (%)</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Tỷ lệ heo chết dự kiến trong suốt quá trình nuôi. Con số này sẽ làm giảm số lượng heo bán ra.
            </div>
          </div>
          <input
            type="text"
            inputMode="decimal"
            id="mortalityRate"
            name="mortalityRate"
            value={params.mortalityRate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Selling Price */}
        <div className="flex flex-col">
          <div className="flex items-center mb-1 group relative">
            <label htmlFor="sellingPricePerKg" className="font-semibold text-gray-600 dark:text-gray-300">Giá bán dự kiến (đ/kg)</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Giá bán heo hơi dự kiến trên mỗi kg. Đây là cơ sở để tính toán doanh thu và các kịch bản lợi nhuận.
            </div>
          </div>
          <input
            type="text"
            id="sellingPricePerKg"
            name="sellingPricePerKg"
            value={formatNumberInput(params.sellingPricePerKg)}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Start Date */}
        <div className="flex flex-col">
          <div className="flex items-center mb-1 group relative">
            <label htmlFor="startDate" className="font-semibold text-gray-600 dark:text-gray-300">Ngày bắt đầu nuôi</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Ngày bắt đầu vào heo. Dùng để tính toán ngày xuất bán dự kiến.
            </div>
          </div>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={params.startDate}
            onChange={handleChange}
            className={`${inputClasses} dark:[color-scheme:dark]`}
          />
        </div>

        {/* Genetic Price */}
        <div className="flex flex-col">
          <div className="flex items-center mb-1 group relative">
            <label htmlFor="geneticPrice" className="font-semibold text-gray-600 dark:text-gray-300">Chi phí con giống (đ/con)</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Chi phí mua một con heo giống. Đây là một phần quan trọng trong tổng chi phí sản xuất.
            </div>
          </div>
          <input
            type="text"
            id="geneticPrice"
            name="geneticPrice"
            value={formatNumberInput(params.geneticPrice)}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        
        {/* Genetic Type */}
        <div className="flex flex-col">
          <div className="flex items-center mb-1 group relative">
            <label htmlFor="geneticType" className="font-semibold text-gray-600 dark:text-gray-300">Loại heo</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Chọn loại heo để nuôi. Heo 3 máu thường có tốc độ tăng trưởng và FCR tốt hơn.
            </div>
          </div>
          <select
            id="geneticType"
            name="geneticType"
            value={params.geneticType}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="3-way">Heo 3 máu</option>
            <option value="2-way">Heo 2 máu</option>
          </select>
        </div>

        {/* Medicine Cost */}
        <div className="flex flex-col">
          <div className="flex items-center mb-1 group relative">
            <label htmlFor="medicineCost" className="font-semibold text-gray-600 dark:text-gray-300">Chi phí thú y (đ/con)</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Tổng chi phí thuốc men, vắc-xin và chăm sóc y tế cho mỗi con heo trong suốt chu kỳ.
            </div>
          </div>
          <input
            type="text"
            id="medicineCost"
            name="medicineCost"
            value={formatNumberInput(params.medicineCost)}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Management Cost */}
        <div className="flex flex-col">
          <div className="flex items-center mb-1 group relative">
            <label htmlFor="managementCost" className="font-semibold text-gray-600 dark:text-gray-300">Chi phí quản lý khác (đ/con)</label>
            <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Bao gồm các chi phí khác như điện, nước, nhân công, khấu hao chuồng trại... tính trên mỗi đầu heo.
            </div>
          </div>
          <input
            type="text"
            id="managementCost"
            name="managementCost"
            value={formatNumberInput(params.managementCost)}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>
      
      {/* Farming Goals Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Mục tiêu Chăn nuôi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Final Weight */}
            <div className="flex flex-col">
              <div className="flex items-center mb-1 group relative">
                <label htmlFor="finalWeight" className="font-semibold text-gray-600 dark:text-gray-300">Cân nặng xuất chuồng (kg)</label>
                 <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Nhập cân nặng mục tiêu khi bán.
                </div>
              </div>
              <input
                type="text"
                inputMode="decimal"
                id="finalWeight"
                name="finalWeight"
                value={params.finalWeight}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            {/* Days to Market */}
            <div className="flex flex-col">
              <div className="flex items-center mb-1 group relative">
                <label htmlFor="daysToMarket" className="font-semibold text-gray-600 dark:text-gray-300">Số ngày nuôi</label>
                 <InfoIcon className="h-4 w-4 ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-center text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Nhập tổng số ngày nuôi mục tiêu.
                </div>
              </div>
              <input
                type="number"
                id="daysToMarket"
                name="daysToMarket"
                value={params.daysToMarket}
                onChange={handleChange}
                className={inputClasses}
                min="1"
              />
            </div>
          </div>
      </div>
    </div>
  );
};

export default InputCard;