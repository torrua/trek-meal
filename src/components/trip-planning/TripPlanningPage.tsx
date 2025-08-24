// src/components/trip-planning/TripPlanningPage.tsx

import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select, { SingleValue } from 'react-select';
import useTripStore from '../../stores/useTripStore';
import useProductStore from '../../stores/useProductStore';
import useParticipantStore from '../../stores/useParticipantStore';
import useDishStore from '../../stores/useDishStore';
import useCategoryStore from '../../stores/useCategoryStore';
import { calculateTripSummary, getMealName, formatDate } from '../../utils';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import ConfirmModal from '../../ui/ConfirmModal';
import TripForm from '../trips/TripForm';
import DishForm from '../dishes/DishForm';
import type { TripData, Product, Dish, Participant, MealPlanItem, Category, SubmitDishAction } from '../../types';

type SelectParticipantOption = { value: number; label: string };
type SelectMealOption = { value: string; label: string };
type GroupedMealOption = { label: string; options: SelectMealOption[] };
type CloningState = {
  instanceId: string;
  dish: Dish;
  mealId: string; // <-- Нам нужно знать, в какой прием пищи добавлять
} | null;

const DishContents = ({ dish }: { dish: Dish }) => {
  const { products: allProducts } = useProductStore();
  const { categories } = useCategoryStore();
  return (
    <ul className="text-xs text-gray-600 pl-5 mt-1 space-y-0.5">
      {dish.products.map(p => {
        const product = allProducts.find(ap => ap.id === p.productId);
        const category = product ? categories.find((c: Category) => c.id === product.categoryId) : null;
        return (
          <li key={`${dish.id}-${p.productId}`} className="flex items-center gap-2">
            <span>{product?.name || '???'}: {p.weight} г</span>
            {category && <span className="text-white text-[10px] px-1.5 rounded-full" style={{ backgroundColor: category.color }}>{category.name}</span>}
          </li>
        );
      })}
    </ul>
  );
};

function TripPlanningPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const numericTripId = tripId ? parseInt(tripId, 10) : undefined;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [cloningState, setCloningState] = useState<CloningState>(null);
  const [expandedDishes, setExpandedDishes] = useState<Record<string, boolean>>({});
  
  const trip = useTripStore(state => state.trips.find(t => t.id === numericTripId));
  const updateTrip = useTripStore(state => state.updateTrip);
  const { products } = useProductStore();
  const { participants } = useParticipantStore();
  const { dishes, addDish } = useDishStore();

  const summary = useMemo(() => 
    calculateTripSummary(trip, products, participants, dishes), 
    [trip, products, participants, dishes]
  );
  
  const groupedMealOptions: GroupedMealOption[] = useMemo(() => {
    const productOptions: SelectMealOption[] = products.map((p: Product) => ({ value: `product-${p.id}`, label: p.name }));
    const dishOptions: SelectMealOption[] = dishes.map((d: Dish) => ({ value: `dish-${d.id}`, label: `⭐ ${d.name}` }));
    
    let options = [];
    if (dishOptions.length > 0) options.push({ label: 'Блюда', options: dishOptions });
    if (productOptions.length > 0) options.push({ label: 'Продукты', options: productOptions });
    return options;
  }, [products, dishes]);

  const availableParticipantsOptions: SelectParticipantOption[] = useMemo(() =>
    participants
      .filter((p: Participant) => !trip?.participants.includes(p.id))
      .map((p: Participant) => ({ value: p.id, label: p.name })),
    [participants, trip]
  );
  
  const handleMealItemAdd = (mealId: string, selectedOption: SingleValue<SelectMealOption>) => {
    if (!trip || !selectedOption) return;
  
    const [type, idStr] = selectedOption.value.split('-');
    const itemId = parseInt(idStr, 10);
    
    let newItem: MealPlanItem;

    if (type === 'dish') {
      newItem = { instanceId: `${Date.now()}`, type: 'dish', itemId };
    } else {
      const product = products.find(p => p.id === itemId);
      newItem = {
        instanceId: `${Date.now()}`,
        type: 'product',
        itemId,
        weight: product?.portions?.[0]?.weight || 0
      };
    }
    
    const newSelectedMeals = JSON.parse(JSON.stringify(trip.selectedMeals || {}));
    if (!newSelectedMeals[mealId]) newSelectedMeals[mealId] = [];
    newSelectedMeals[mealId].push(newItem);
    updateTrip(trip.id, { selectedMeals: newSelectedMeals });
  };
  
  const handleMealItemRemove = (mealId: string, instanceId: string) => {
    if (!trip) return;
    const newSelectedMeals = JSON.parse(JSON.stringify(trip.selectedMeals || {}));
    if (newSelectedMeals[mealId]) {
      newSelectedMeals[mealId] = newSelectedMeals[mealId].filter((item: MealPlanItem) => item.instanceId !== instanceId);
      updateTrip(trip.id, { selectedMeals: newSelectedMeals });
    }
  };

  const handleCloneRequest = (instanceId: string, dish: Dish, mealId: string) => {
    setCloningState({ instanceId, dish, mealId });
  };

  const handleCloneConfirm = () => {
    if (cloningState) {
      setIsDishFormOpen(true);
    }
  };
  
  const handleCloneSubmit = (newDishData: DishData, action: SubmitDishAction) => {
    const newDish = addDish(newDishData);
    if (!newDish || !trip || !cloningState) {
      setIsDishFormOpen(false);
      setCloningState(null);
      return;
    };
    
    const newSelectedMeals = JSON.parse(JSON.stringify(trip.selectedMeals));
    
    if (action === 'replace') {
      let itemReplaced = false;
      for (const mealId in newSelectedMeals) {
        const mealItems = newSelectedMeals[mealId] as MealPlanItem[];
        const itemIndex = mealItems.findIndex(item => item.instanceId === cloningState.instanceId);
        if (itemIndex !== -1) {
          mealItems[itemIndex] = { ...mealItems[itemIndex], itemId: newDish.id };
          itemReplaced = true;
          break;
        }
      }
      if (itemReplaced) {
        updateTrip(trip.id, { selectedMeals: newSelectedMeals });
      }
    } else if (action === 'add_as_new') {
      // --- ИСПРАВЛЕНИЕ: Добавляем новое блюдо в текущий прием пищи ---
      const mealId = cloningState.mealId;
      const newItem: MealPlanItem = { instanceId: `${Date.now()}`, type: 'dish', itemId: newDish.id };
      if (!newSelectedMeals[mealId]) newSelectedMeals[mealId] = [];
      newSelectedMeals[mealId].push(newItem);
      updateTrip(trip.id, { selectedMeals: newSelectedMeals });
    }
    
    setIsDishFormOpen(false);
    setCloningState(null);
  };
  
  const toggleDishExpansion = (instanceId: string) => {
    setExpandedDishes(prev => ({ ...prev, [instanceId]: !prev[instanceId] }));
  };
  
  const handleParticipantAdd = (selectedOption: SingleValue<SelectParticipantOption>) => {
    if (!trip || !selectedOption) return;
    updateTrip(trip.id, { participants: [...trip.participants, selectedOption.value] });
  };

  const handleParticipantRemove = (participantId: number) => {
    if (!trip) return;
    updateTrip(trip.id, { participants: trip.participants.filter(id => id !== participantId) });
  };

  const handleDetailsUpdate = (formData: TripData) => {
    if (!trip) return;
    updateTrip(trip.id, formData);
    setIsEditModalOpen(false);
  };

  if (!trip) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Поход не найден</h2>
        <p className="text-gray-500 my-4">Возможно, он был удален или вы перешли по неверной ссылке.</p>
        <Button onClick={() => navigate('/trips')} className="mt-4">Назад к походам</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{trip.name}</h2>
          <p className="text-sm text-gray-500">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost" onClick={() => setIsEditModalOpen(true)}>Редактировать</Button>
          <Button variant="ghost" onClick={() => navigate('/trips')}>← К списку походов</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">План питания</h3>
          {Array.from({ length: trip.days }).map((_, dayIndex) => (
            <div key={dayIndex} className="border rounded-lg">
              <h4 className="p-3 bg-gray-50 font-bold border-b">День {dayIndex + 1}</h4>
              <div className="divide-y">
                {Array.from({ length: trip.mealsPerDay }).map((_, mealIndex) => {
                  const mealId = `${dayIndex + 1}-${mealIndex + 1}`;
                  const selectedItems = (trip.selectedMeals?.[mealId] || []) as MealPlanItem[];

                  return (
                    <div key={mealIndex} className="p-3">
                      <h5 className="font-semibold mb-2">{getMealName(mealIndex + 1, trip.mealsPerDay)}</h5>
                      <div className="space-y-1 mb-2">
                        {selectedItems.map((item) => {
                          let content = null;
                          if (item.type === 'dish') {
                            const dish = dishes.find(d => d.id === item.itemId);
                            if (dish) {
                              const totalWeight = dish.products.reduce((sum, p) => sum + p.weight, 0);
                              const isExpanded = expandedDishes[item.instanceId];
                              content = (
                                <div>
                                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleDishExpansion(item.instanceId)}>
                                    <span>⭐ {dish.name} ({totalWeight} г)</span>
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <button onClick={() => handleCloneRequest(item.instanceId, dish, mealId)} className="text-blue-600 hover:text-blue-800 text-xs">[Ред.]</button>
                                      <button onClick={() => handleMealItemRemove(mealId, item.instanceId)} className="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
                                    </div>
                                  </div>
                                  {isExpanded && <DishContents dish={dish} />}
                                </div>
                              );
                            } else {
                                content = <div className="italic text-gray-500">Блюдо не найдено</div>;
                            }
                          } else { // item.type === 'product'
                            const product = products.find(p => p.id === item.itemId);
                            content = (
                              <div className="flex items-center justify-between">
                                <span>{product?.name || 'Продукт не найден'} ({item.weight} г)</span>
                                <button onClick={() => handleMealItemRemove(mealId, item.instanceId)} className="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
                              </div>
                            );
                          }
                          return <div key={item.instanceId} className="text-sm p-1.5 bg-blue-50 rounded">{content}</div>;
                        })}
                      </div>
                      <Select<SelectMealOption, false, GroupedMealOption>
                        options={groupedMealOptions}
                        onChange={(option) => handleMealItemAdd(mealId, option)}
                        placeholder="Добавить продукт или блюдо..."
                        value={null}
                        formatGroupLabel={data => (
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-600">{data.label}</span>
                            <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-1.5">{data.options.length}</span>
                          </div>
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold">Сводка</h3>
            <div className="p-4 mt-2 border rounded-lg bg-white">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div><div className="text-xl font-bold text-blue-600">{summary.tripParticipants.length}</div><div className="text-xs text-gray-500 uppercase">Участников</div></div>
                <div><div className="text-xl font-bold text-blue-600">{(summary.totalWeight / 1000).toFixed(2)}</div><div className="text-xs text-gray-500 uppercase">Кг еды</div></div>
                <div><div className="text-xl font-bold text-blue-600">{summary.averageWeightPerPersonPerDay}</div><div className="text-xs text-gray-500 uppercase">г/чел/день</div></div>
                <div><div className="text-xl font-bold text-blue-600">{summary.averageCaloriesPerPersonPerDay}</div><div className="text-xs text-gray-500 uppercase">ккал/чел/день</div></div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold">Участники ({summary.tripParticipants.length})</h3>
            <div className="space-y-2 mt-2">
              <Select
                options={availableParticipantsOptions}
                onChange={handleParticipantAdd}
                placeholder="Добавить участника..."
                value={null}
                noOptionsMessage={() => 'Все участники уже в походе'}
              />
              <div className="p-4 border rounded-lg bg-white space-y-1">
                {summary.tripParticipants.length > 0 ? (
                  summary.tripParticipants.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm p-1.5 bg-gray-50 rounded">
                      <span>{p.name}</span>
                      <button onClick={() => handleParticipantRemove(p.id)} className="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Добавьте участников</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Редактировать поход"
      >
        <TripForm 
          trip={trip}
          onSubmit={handleDetailsUpdate}
          onCancel={() => setIsEditModalOpen(false)} 
        />
      </Modal>

      <ConfirmModal
        isOpen={!!cloningState}
        onClose={() => setCloningState(null)}
        onConfirm={handleCloneConfirm}
        title={`Редактировать "${cloningState?.dish.name}"?`}
        confirmText="Создать и редактировать копию"
      >
        <p>Чтобы изменить состав этого блюда, будет создана его редактируемая копия. Исходный шаблон останется без изменений.</p>
      </ConfirmModal>

      <Modal isOpen={isDishFormOpen} onClose={() => { setIsDishFormOpen(false); setCloningState(null); }} title={`Редактирование копии блюда`}>
        <DishForm
          dish={null}
          dishToClone={cloningState?.dish || null}
          onSubmit={handleCloneSubmit}
          onCancel={() => { setIsDishFormOpen(false); setCloningState(null); }}
        />
      </Modal>
    </div>
  );
}

export default TripPlanningPage;