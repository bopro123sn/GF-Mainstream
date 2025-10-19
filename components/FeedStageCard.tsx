import React from 'react';
import { Stage, Feed } from '../types';
import { feedDatabase, stageToPhaseMap } from '../feedDatabase';
import { PlusCircleIcon, TrashIcon } from './Icons';

interface FeedStageCardProps {
  stage: Stage;
  onStageChange: (updatedStage: Stage) => void;
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

const FeedStageCard: React.FC<FeedStageCardProps> = ({ stage, onStageChange }) => {
  const phase = stageToPhaseMap[stage.name];
  const allAvailableProducts = feedDatabase.filter(f => f.phase === phase);
  const selectedProductCodes = stage.feeds.map(f => f.productCode);

  const handleFeedChange = (feedId: string, field: keyof Feed, value: string | number) => {
    const updatedFeeds = stage.feeds.map(feed => {
      if (feed.id === feedId) {
        const newValue = String(value);
        if (field === 'pricePerBag') {
            return { ...feed, pricePerBag: parseNumberInput(newValue) };
        }
        if (field === 'productCode') {
            return { ...feed, productCode: newValue };
        }
        if (field === 'bagsConsumed') {
            if (newValue === '' || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
                return { ...feed, bagsConsumed: newValue };
            }
            return feed; // Keep old value if invalid
        }
      }
      return feed;
    });
    onStageChange({ ...stage, feeds: updatedFeeds });
  };
  
  const handleAddFeed = () => {
    const unselectedProducts = allAvailableProducts.filter(p => !selectedProductCodes.includes(p.code));

    if (unselectedProducts.length === 0) return; // Don't add if no more products are available

    const newFeed: Feed = {
      id: new Date().getTime().toString(),
      productCode: unselectedProducts[0].code, // Default to the first available unselected product
      pricePerBag: 0,
      bagsConsumed: 0,
    };
    onStageChange({ ...stage, feeds: [...stage.feeds, newFeed] });
  };

  const handleRemoveFeed = (feedId: string) => {
    if (stage.feeds.length <= 1) return; // Cannot remove the last feed
    const updatedFeeds = stage.feeds.filter(feed => feed.id !== feedId);
    onStageChange({ ...stage, feeds: updatedFeeds });
  };

  const canAddMore = selectedProductCodes.length < allAvailableProducts.length;
  const inputClasses = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#00973E] focus:border-transparent dark:bg-slate-700 dark:border-slate-600";


  return (
    <div className="bg-white p-5 rounded-xl shadow-md flex flex-col h-full dark:bg-slate-800">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{stage.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{stage.name === 'Heo thịt' ? `Giai đoạn > ${stage.startWeight}kg` : `Giai đoạn ${stage.startWeight}kg - ${stage.endWeight}kg`}</p>
      
      <div className="space-y-4 flex-grow">
        {stage.feeds.map((feed) => {
            const otherSelectedCodes = selectedProductCodes.filter(code => code !== feed.productCode);
            const dropdownOptions = allAvailableProducts.filter(p => !otherSelectedCodes.includes(p.code));

            return (
              <div key={feed.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-slate-700/50 dark:border-slate-600">
                <div className="grid grid-cols-1 gap-4">
                  {/* Product Code */}
                  <div>
                    <label htmlFor={`productCode-${feed.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã sản phẩm</label>
                    <select
                      id={`productCode-${feed.id}`}
                      value={feed.productCode}
                      onChange={(e) => handleFeedChange(feed.id, 'productCode', e.target.value)}
                      className={inputClasses}
                    >
                      {dropdownOptions.map(f => <option key={f.code} value={f.code}>{f.code}</option>)}
                    </select>
                  </div>

                  {/* Price per bag */}
                  <div>
                    <label htmlFor={`pricePerBag-${feed.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá / bao (VND)</label>
                    <input
                      type="text"
                      id={`pricePerBag-${feed.id}`}
                      value={formatNumberInput(feed.pricePerBag)}
                      onChange={(e) => handleFeedChange(feed.id, 'pricePerBag', e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  {/* Bags Consumed */}
                  <div>
                    <label htmlFor={`bagsConsumed-${feed.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số bao tiêu thụ / con (dự kiến)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      id={`bagsConsumed-${feed.id}`}
                      value={feed.bagsConsumed}
                      onChange={(e) => handleFeedChange(feed.id, 'bagsConsumed', e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>
                 {stage.feeds.length > 1 && (
                    <div className="text-right mt-2">
                        <button onClick={() => handleRemoveFeed(feed.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
              </div>
            )
        })}
      </div>
      
      <div className="mt-4">
        <button 
          onClick={handleAddFeed}
          disabled={!canAddMore}
          className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-600 dark:text-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:disabled:bg-slate-700/50 dark:disabled:text-gray-500"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
          {canAddMore ? 'Thêm sản phẩm' : 'Đã hết sản phẩm'}
        </button>
      </div>

    </div>
  );
};

export default FeedStageCard;