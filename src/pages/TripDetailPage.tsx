// src/pages/TripDetailPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useTripStore from '../stores/useTripStore';
import TripForm from '../components/trips/TripForm';
import type { TripData } from '../types';
import { ArrowLeft, Route } from 'lucide-react';
import Button from '../ui/Button';

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const isNew = !tripId || tripId === 'new';
  const numericId = !isNew && tripId ? parseInt(tripId, 10) : null;

  const { trips, addTrip, updateTrip } = useTripStore();
  const trip = useMemo(
    () => (numericId ? trips.find((t) => t.id === numericId) || null : null),
    [numericId, trips]
  );

  if (!isNew && !trip) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl text-danger">Поход не найден</h2>
          <Link to="/trips" className="inline-block mt-4">
            <Button variant="secondary">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: TripData) => {
    if (isNew) {
      addTrip(data);
    } else if (numericId) {
      updateTrip(numericId, data);
    }
    navigate('/trips');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/trips')} className="mr-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Route className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новый поход' : 'Редактирование похода'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Заполните данные нового похода.' : 'Обновите данные существующего похода.'}
            </p>
          </div>
        </div>

        <TripForm
          trip={trip ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/trips')}
        />
      </div>
    </div>
  );
};

export default TripDetailPage;
