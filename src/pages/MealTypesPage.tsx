// src/pages/MealTypesPage.tsx

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  Utensils,
  Edit,
  Trash2,
  Copy,
  Share,
  X,
  Check,
  CheckCheck,
  LayoutList,
  Grid3X3,
  UploadCloud,
} from 'lucide-react';
import useMealTypesStore from '../stores/useMealTypesStore';
import { exportBulkMealTypesToJson, importDataFromJson } from '../utils/backup';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import { useViewMode } from '../hooks/useViewMode';
import CreateMealTypeButton from '../components/meal-types/CreateMealTypeButton';
import MealTypeForm from '../components/meal-types/MealTypeForm';
import MealTypeDetail from '../components/meal-types/MealTypeDetail';
import type { MealType } from '../types';

const MealTypesPage: React.FC = () => {
  const { mealTypes, deleteMealType, updateMealType, addMealType } = useMealTypesStore();
  const { viewMode, toggleViewMode } = useViewMode('meal-types');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [detailEditTrigger, setDetailEditTrigger] = useState(0);
  const [editSubmitTrigger, setEditSubmitTrigger] = useState(0);
  const [editCancelTrigger, setEditCancelTrigger] = useState(0);

  // Multi-selection state
  const [selectedMealTypeIds, setSelectedMealTypeIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);

  // Detail Pane state
  const [openSections, setOpenSections] = useState<string[]>(['basic-info']);

  const sortedMealTypes = useMemo(() => {
    try {
      return [...mealTypes].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error sorting meal types:', error);
      return [];
    }
  }, [mealTypes]);

  const selectedMealType = useMemo(() => {
    try {
      return mealTypes.find((mt) => mt.id === activeId) || null;
    } catch (error) {
      console.error('Error finding meal type:', error);
      return null;
    }
  }, [mealTypes, activeId]);

  const editingMealType = isCreatingNew ? null : selectedMealType;

  // Handlers

  const handleDeleteRequest = useCallback((mealType: MealType) => {
    setTypeToDelete(mealType);
  }, []);

  const handleDeleteConfirm = () => {
    if (typeToDelete) {
      if (typeToDelete.id === activeId) setActiveId(null);
      deleteMealType(typeToDelete.id);
      setTypeToDelete(null);
    }
  };

  // Form handlers
  const handleFormSubmit = async (data: { name: string; description?: string }) => {
    try {
      setIsSubmitting(true);

      if (editingMealType) {
        updateMealType(editingMealType.id, data.name);
        toast.success('Тип приёма пищи обновлён');
        setEditSubmitTrigger((t) => t + 1);
      } else {
        addMealType(data.name);
        toast.success('Тип приёма пищи создан');
      }

      setShowForm(false);
      setIsCreatingNew(false);
      setIsDetailEditing(false);
    } catch (error) {
      console.error('Error saving meal type:', error);
      toast.error('Ошибка при сохранении типа приёма пищи');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setIsCreatingNew(false);
    setIsDetailEditing(false);
    setActiveId(null);
    setEditCancelTrigger((t) => t + 1);
  };

  const handleCreateNew = () => {
    try {
      setIsDetailEditing(false);
      setIsCreatingNew(true);
      setShowForm(false);
      setActiveId(null);
      setOpenSections(['basic-info']);

      const newTrigger = detailEditTrigger + 1;
      setIsDetailEditing(true);
      setDetailEditTrigger(newTrigger);
    } catch (error) {
      console.error('Error in handleCreateNew:', error);
      toast.error('Ошибка при создании типа приёма пищи');
    }
  };

  const handleEdit = (mealType: MealType) => {
    setActiveId(mealType.id);
    setIsDetailEditing(true);
    setOpenSections((prev) => (prev.includes('basic-info') ? prev : [...prev, 'basic-info']));
    setDetailEditTrigger((t) => t + 1);
  };

  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedMealTypeIds([]);
    }
  };

  const toggleMealTypeSelection = (mealTypeId: number) => {
    setSelectedMealTypeIds((prev: number[]) =>
      prev.includes(mealTypeId)
        ? prev.filter((id: number) => id !== mealTypeId)
        : [...prev, mealTypeId]
    );
  };

  const selectAllMealTypes = () => {
    setSelectedMealTypeIds(sortedMealTypes.map((mealType: MealType) => mealType.id));
  };

  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedMealTypeIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedMealTypeIds.length === 0) return;
    console.log(`Deleting meal types: ${selectedMealTypeIds.join(', ')}`);
  };

  const handleBulkClone = () => {
    if (selectedMealTypeIds.length === 0) return;
    console.log(`Cloning meal types: ${selectedMealTypeIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedMealTypeIds.length === 0) return;
    const selectedMealTypes = sortedMealTypes.filter((mt) => selectedMealTypeIds.includes(mt.id));
    exportBulkMealTypesToJson(selectedMealTypes);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJson(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClone = useCallback((mealType: MealType) => {
    useMealTypesStore.getState().cloneMealType(mealType.id);
  }, []);

  const handleExport = useCallback((mealType: MealType) => {
    try {
      const jsonString = JSON.stringify(mealType, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const safeName = mealType.name.replace(/\s+/g, '-').toLowerCase();
      a.download = `meal-type-${safeName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Данные типа приёма пищи "${mealType.name}" экспортированы!`);
    } catch (error) {
      console.error('Ошибка при экспорте данных типа приёма пищи:', error);
      toast.error('Произошла ошибка при экспорте.');
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      {/* Header and buttons */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Типы приёмов пищи
          </h1>
          <div className="flex items-center gap-2">
            {!showMultiSelect ? (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Импорт"
                  aria-label="Импорт"
                >
                  <UploadCloud className="w-4 h-4" />
                </Button>

                <Button
                  onClick={toggleViewMode}
                  variant="secondary"
                  size="icon"
                  title={viewMode === 'default' ? 'Компактный вид' : 'Полный вид'}
                >
                  {viewMode === 'default' ? (
                    <LayoutList className="w-4 h-4" />
                  ) : (
                    <Grid3X3 className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  onClick={toggleMultiSelect}
                  variant="secondary"
                  size="icon"
                  title="Выделить"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <CreateMealTypeButton
                  onClick={handleCreateNew}
                  disabled={isDetailEditing || isCreatingNew}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedMealTypeIds.length}</span>
                  <span className="text-primary/70">из {sortedMealTypes.length} выделено</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllMealTypes}
                  disabled={selectedMealTypeIds.length === sortedMealTypes.length}
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedMealTypeIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedMealTypeIds.length === 0}
                    title="Экспорт"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedMealTypeIds.length === 0}
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Button onClick={exitMultiSelectMode} variant="ghost" size="icon" title="Закрыть">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      {sortedMealTypes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3">
            {sortedMealTypes.map((mealType) => {
              const menuItems: MenuItem[] = [
                {
                  label: 'Редактировать',
                  icon: Edit,
                  onClick: () => handleEdit(mealType),
                },
                {
                  label: 'Клонировать',
                  icon: Copy,
                  onClick: () => handleClone(mealType),
                },
                {
                  label: 'Экспорт',
                  icon: Share,
                  onClick: () => handleExport(mealType),
                },
                {
                  label: 'Удалить',
                  icon: Trash2,
                  onClick: () => handleDeleteRequest(mealType),
                  className: 'text-danger hover:bg-danger/10',
                },
              ];

              return (
                <EntityCard
                  key={mealType.id}
                  title={mealType.name}
                  icon={Utensils}
                  iconColor="text-primary"
                  details={[
                    {
                      key: 'usage',
                      icon: Utensils,
                      text: 'Многократный',
                    },
                  ]}
                  isSelected={activeId === mealType.id}
                  isMultiSelected={selectedMealTypeIds.includes(mealType.id)}
                  onSelect={() => setActiveId(mealType.id)}
                  onMultiSelect={() => toggleMealTypeSelection(mealType.id)}
                  borderColor="#6b7280"
                  menuItems={menuItems}
                  data-testid={`meal-type-card-${mealType.id}`}
                  showMultiSelect={showMultiSelect}
                  viewMode={viewMode}
                />
              );
            })}
          </div>

          {/* Detail panel (Right Column) */}
          <div className="lg:col-span-2">
            {isCreatingNew ? (
              <MealTypeDetail
                mealType={null}
                onEdit={() => {
                  // Ничего не делаем - для нового типа редактирование не применимо
                }}
                editTrigger={detailEditTrigger}
                openSections={openSections}
                onToggleSection={(id) =>
                  setOpenSections((prev) =>
                    prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
                  )
                }
                onStartEdit={() => setIsDetailEditing(true)}
                onFinishEdit={() => {
                  setIsDetailEditing(false);
                  setIsCreatingNew(false);
                }}
                editSubmitTrigger={editSubmitTrigger}
                editCancelTrigger={editCancelTrigger}
              />
            ) : selectedMealType ? (
              <MealTypeDetail
                mealType={selectedMealType}
                onEdit={() => setIsDetailEditing(true)}
                editTrigger={detailEditTrigger}
                openSections={openSections}
                onToggleSection={(id) =>
                  setOpenSections((prev) =>
                    prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
                  )
                }
                onStartEdit={() => setIsDetailEditing(true)}
                onFinishEdit={() => setIsDetailEditing(false)}
                editSubmitTrigger={editSubmitTrigger}
                editCancelTrigger={editCancelTrigger}
              />
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Выберите тип приёма пищи
                  </h3>
                  <p className="text-muted-foreground">
                    Выберите тип из списка, чтобы увидеть подробную информацию
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : isCreatingNew ? (
        // Показываем форму создания даже если нет типов
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3">{/* Пустой левый блок */}</div>

          {/* Detail panel (Right Column) */}
          <div className="lg:col-span-2">
            {isCreatingNew ? (
              <MealTypeDetail
                mealType={null}
                onEdit={() => {
                  // Ничего не делаем - для нового типа редактирование не применимо
                }}
                editTrigger={detailEditTrigger}
                openSections={openSections}
                onToggleSection={(id) =>
                  setOpenSections((prev) =>
                    prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
                  )
                }
                onStartEdit={() => setIsDetailEditing(true)}
                onFinishEdit={() => {
                  setIsDetailEditing(false);
                  setIsCreatingNew(false);
                }}
                editSubmitTrigger={editSubmitTrigger}
                editCancelTrigger={editCancelTrigger}
              />
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Выберите тип приёма пищи
                  </h3>
                  <p className="text-muted-foreground">
                    Выберите тип из списка, чтобы увидеть подробную информацию
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">Типов пока нет</h3>
          <CreateMealTypeButton onClick={handleCreateNew} variant="primary" showText={true} />
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingMealType ? 'Редактировать тип приёма пищи' : 'Новый тип приёма пищи'}
      >
        <MealTypeForm
          mealType={editingMealType}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!typeToDelete}
        onClose={() => setTypeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить тип приёма пищи"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      >
        Вы уверены, что хотите удалить тип &quot;{typeToDelete?.name}&quot;? Если этот тип
        используется в походах, удаление будет невозможно.
      </ConfirmModal>
    </div>
  );
};

export default MealTypesPage;
