// src/pages/ParticipantDetailPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useParticipantStore from '../stores/useParticipantStore';
import ParticipantForm from '../components/participants/ParticipantForm';
import type { ParticipantData } from '../types';
import { ArrowLeft, Users } from 'lucide-react';
import Button from '../ui/Button';

const ParticipantDetailPage: React.FC = () => {
  const { participantId } = useParams<{ participantId: string }>();
  const navigate = useNavigate();
  const isNew = !participantId || participantId === 'new';
  const numericId = !isNew && participantId ? parseInt(participantId, 10) : null;

  const { participants, addParticipant, updateParticipant } = useParticipantStore();
  const participant = useMemo(
    () => (numericId ? participants.find((p) => p.id === numericId) || null : null),
    [numericId, participants]
  );

  if (!isNew && !participant) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl text-danger">Участник не найден</h2>
          <Link to="/participants" className="inline-block mt-4">
            <Button variant="secondary">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: ParticipantData) => {
    if (isNew) {
      addParticipant(data);
    } else if (numericId) {
      updateParticipant(numericId, data);
    }
    navigate('/participants');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/participants')} className="mr-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новый участник' : 'Редактирование участника'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Заполните данные нового участника.' : 'Обновите данные участника.'}
            </p>
          </div>
        </div>

        <ParticipantForm
          participant={participant ?? null}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/participants')}
        />
      </div>
    </div>
  );
};

export default ParticipantDetailPage;
