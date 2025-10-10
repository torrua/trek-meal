// src/pages/EquipmentDetailPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useEquipmentStore from '../stores/useEquipmentStore';
import EquipmentForm from '../components/equipment/EquipmentForm';
import type { EquipmentData } from '../types';
import { ArrowLeft, Backpack } from 'lucide-react';
import Button from '../ui/Button';

const EquipmentDetailPage: React.FC = () => {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();
  const isNew = !equipmentId || equipmentId === 'new';
  const numericId = !isNew && equipmentId ? parseInt(equipmentId, 10) : null;

  const { equipment, addEquipment, updateEquipment } = useEquipmentStore();
  const equipmentItem = useMemo(
    () => (numericId ? equipment.find((e) => e.id === numericId) || null : null),
    [numericId, equipment]
  );

  if (!isNew && !equipmentItem) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl text-danger">Снаряжение не найдено</h2>
          <Link to="/equipment" className="inline-block mt-4">
            <Button variant="secondary">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: EquipmentData) => {
    if (isNew) {
      addEquipment(data);
    } else if (numericId) {
      updateEquipment(numericId, data);
    }
    navigate('/equipment');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/equipment')} className="mr-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Backpack className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новое снаряжение' : 'Редактирование снаряжения'}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? 'Заполните данные нового снаряжения.'
                : 'Обновите данные существующего снаряжения.'}
            </p>
          </div>
        </div>

        <EquipmentForm
          equipment={equipmentItem ?? null}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/equipment')}
        />
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
