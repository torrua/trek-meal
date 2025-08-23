import React from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  background: white;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const FormTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 500;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const InfoText = styled.p`
  margin: 6px 0 0 0;
  font-size: 0.8rem;
  color: #666;
`;

function TripForm({ tripData, onTripDataChange }) {
  const handleChange = (field, value) => {
    onTripDataChange({
      ...tripData,
      [field]: parseInt(value) || 1
    });
  };

  return (
    <FormContainer>
      <FormTitle>Параметры похода</FormTitle>
      
      <FormGroup>
        <Label htmlFor="days">Количество дней</Label>
        <Input
          id="days"
          type="number"
          min="1"
          max="30"
          value={tripData.days}
          onChange={(e) => handleChange('days', e.target.value)}
        />
        <InfoText>Продолжительность похода в днях</InfoText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="participants">Количество участников</Label>
        <Input
          id="participants"
          type="number"
          min="1"
          max="20"
          value={tripData.participants}
          onChange={(e) => handleChange('participants', e.target.value)}
        />
        <InfoText>Сколько человек будет в походе</InfoText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="mealsPerDay">Приемов пищи в день</Label>
        <Select
          id="mealsPerDay"
          value={tripData.mealsPerDay}
          onChange={(e) => handleChange('mealsPerDay', e.target.value)}
        >
          <option value={3}>3 (Завтрак, Обед, Ужин)</option>
          <option value={4}>4 (Завтрак, Перекус, Обед, Ужин)</option>
          <option value={5}>5 (Завтрак, Перекус, Обед, Перекус, Ужин)</option>
        </Select>
        <InfoText>Количество приемов пищи в день</InfoText>
      </FormGroup>
    </FormContainer>
  );
}

export default TripForm;
