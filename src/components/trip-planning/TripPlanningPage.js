import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import useTripStore from '../../stores/useTripStore';
import useProductStore from '../../stores/useProductStore';
import useParticipantStore from '../../stores/useParticipantStore';
import { calculateTripSummary, getMealName, formatDate } from '../../utils';
import Button from '../../ui/Button';

function TripPlanningPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  // Получаем данные и методы из всех необходимых сторов
  const trip = useTripStore(state => state.trips.find(t => t.id === Number(tripId)));
  const updateTrip = useTripStore(state => state.updateTrip);
  const { products } = useProductStore();
  const { participants } = useParticipantStore();

  // --- Мемоизированные селекторы для производительности ---
  const summary = useMemo(() => calculateTripSummary(trip, products, participants), [trip, products, participants]);
  const productOptions = useMemo(() => products.map(p => ({ value: p.id, label: p.name })), [products]);
  
  if (!trip) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Поход не найден</h2>
        <Button onClick={() => navigate('/trips')} className="mt-4">Назад к походам</Button>
      </div>
    );
  }

  // --- Обработчики действий ---
  const handleProductChange = (dayIndex, mealIndex, productId, action) => {
    const mealId = `${dayIndex + 1}-${mealIndex + 1}`;
    const newSelectedMeals = JSON.parse(JSON.stringify(trip.selectedMeals || {}));
    
    if (!newSelectedMeals[mealId]) newSelectedMeals[mealId] = [];

    if (action === 'add') {
      const product = products.find(p => p.id === productId);
      if (!product || newSelectedMeals[mealId].some(item => item.productId === productId)) return;
      
      newSelectedMeals[mealId].push({ productId: product.id, weight: product.portions?.[0]?.weight || 0 });
    } else if (action === 'remove') {
      newSelectedMeals[mealId] = newSelectedMeals[mealId].filter(item => item.productId !== productId);
    }
    
    updateTrip(trip.id, { selectedMeals: newSelectedMeals });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{trip.name}</h2>
          <p className="text-sm text-gray-500">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/trips')}>← К списку походов</Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - План питания */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">План питания</h3>
          {Array.from({ length: trip.days }).map((_, dayIndex) => (
            <div key={dayIndex} className="border rounded-lg">
              <h4 className="p-3 bg-gray-50 font-bold border-b">День {dayIndex + 1}</h4>
              <div className="divide-y">
                {Array.from({ length: trip.mealsPerDay }).map((_, mealIndex) => {
                  const mealId = `${dayIndex + 1}-${mealIndex + 1}`;
                  const selectedProducts = trip.selectedMeals?.[mealId] || [];
                  const selectedProductIds = selectedProducts.map(p => p.productId);

                  return (
                    <div key={mealIndex} className="p-3">
                      <h5 className="font-semibold mb-2">{getMealName(mealIndex + 1, trip.mealsPerDay)}</h5>
                      <div className="space-y-2 mb-2">
                        {selectedProducts.map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <div key={item.productId} className="flex justify-between items-center text-sm p-1.5 bg-blue-50 rounded">
                              <span>{product?.name} ({item.weight} г)</span>
                              <button onClick={() => handleProductChange(dayIndex, mealIndex, item.productId, 'remove')} className="text-red-500 hover:text-red-700">&times;</button>
                            </div>
                          );
                        })}
                      </div>
                      <Select
                        options={productOptions.filter(opt => !selectedProductIds.includes(opt.value))}
                        onChange={(option) => handleProductChange(dayIndex, mealIndex, option.value, 'add')}
                        placeholder="Добавить продукт..."
                        value={null}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Правая колонка - Сводка */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Сводка</h3>
          <div className="p-4 border rounded-lg bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-card"><div className="stat-value">{summary.tripParticipants.length}</div><div className="stat-label">Участников</div></div>
              <div className="stat-card"><div className="stat-value">{(summary.totalWeight / 1000).toFixed(2)}</div><div className="stat-label">Кг еды</div></div>
              <div className="stat-card"><div className="stat-value">{summary.averageWeightPerPersonPerDay}</div><div className="stat-label">г/чел/день</div></div>
              <div className="stat-card"><div className="stat-value">{summary.averageCaloriesPerPersonPerDay}</div><div className="stat-label">ккал/чел/день</div></div>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-white">
            <h4 className="font-semibold mb-2">Участники</h4>
            <ul className="list-disc pl-5 text-sm">
              {summary.tripParticipants.map(p => <li key={p.id}>{p.name}</li>)}
            </ul>
          </div>
        </div>
      </div>
      <style jsx>{`
        .stat-card { @apply text-center p-2 bg-gray-50 rounded; }
        .stat-value { @apply text-xl font-bold text-blue-600; }
        .stat-label { @apply text-xs text-gray-500 uppercase; }
      `}</style>
    </div>
  );
}

export default TripPlanningPage;