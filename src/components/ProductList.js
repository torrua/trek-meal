import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 500;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
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

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  resize: vertical;
  min-height: 60px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const Select = styled.select`
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

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 20px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .2s;
    border-radius: 20px;
    
    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .2s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: #007acc;
  }
  
  input:checked + span:before {
    transform: translateX(24px);
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #005a9e;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const ProductItem = styled.div`
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ProductTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
`;

const ProductMeta = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  padding: 3px 6px;
  background: #e8e8e8;
  color: #555;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ProductDescription = styled.p`
  color: #666;
  margin: 8px 0;
  font-size: 0.85rem;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 12px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const NutritionItem = styled.div`
  text-align: center;
  padding: 6px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const NutritionValue = styled.div`
  font-weight: 600;
  color: #007acc;
  font-size: 1rem;
`;

const NutritionLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 2px;
`;

const PortionsSection = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const PortionsTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 0.9rem;
`;

const PortionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const PortionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PortionWeight = styled.span`
  font-weight: 500;
  color: #333;
`;

const PortionDivisible = styled.span`
  font-size: 0.75rem;
  color: #666;
`;

const DeleteButton = styled.button`
  padding: 6px 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.8rem;
  
  &:hover {
    background: #c82333;
  }
`;

const EmptyState = styled.p`
  text-align: center;
  color: #666;
  margin: 16px 0;
  font-size: 0.9rem;
`;

function ProductList({ products, onProductAdd, onProductDelete }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    proteins: '',
    fats: '',
    carbs: '',
    isPerishable: false,
    packaging: '',
    portions: [{ weight: '', isDivisible: false }]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.portions.some(p => p.weight > 0)) {
      onProductAdd({
        ...formData,
        id: Date.now(),
        calories: parseFloat(formData.calories) || 0,
        proteins: parseFloat(formData.proteins) || 0,
        fats: parseFloat(formData.fats) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        portions: formData.portions.map(p => ({
          ...p,
          weight: parseFloat(p.weight) || 0
        }))
      });
      setFormData({
        name: '',
        description: '',
        calories: '',
        proteins: '',
        fats: '',
        carbs: '',
        isPerishable: false,
        packaging: '',
        portions: [{ weight: '', isDivisible: false }]
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePortionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      portions: prev.portions.map((portion, i) => 
        i === index ? { ...portion, [field]: value } : portion
      )
    }));
  };

  const addPortion = () => {
    setFormData(prev => ({
      ...prev,
      portions: [...prev.portions, { weight: '', isDivisible: false }]
    }));
  };

  const removePortion = (index) => {
    if (formData.portions.length > 1) {
      setFormData(prev => ({
        ...prev,
        portions: prev.portions.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <Container>
      <Title>Список продуктов</Title>
      
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label htmlFor="name">Название продукта *</Label>
            <Input
              id="name"
              placeholder="Например: Овсянка"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="packaging">Упаковка</Label>
            <Select
              id="packaging"
              value={formData.packaging}
              onChange={(e) => handleChange('packaging', e.target.value)}
            >
              <option value="">Выберите упаковку</option>
              <option value="пакет">Пакет</option>
              <option value="банка">Банка</option>
              <option value="коробка">Коробка</option>
              <option value="бутылка">Бутылка</option>
              <option value="другое">Другое</option>
            </Select>
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            placeholder="Краткое описание продукта..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="calories">Калории (ккал)</Label>
            <Input
              id="calories"
              type="number"
              step="0.1"
              placeholder="0"
              value={formData.calories}
              onChange={(e) => handleChange('calories', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="proteins">Белки (г)</Label>
            <Input
              id="proteins"
              type="number"
              step="0.1"
              placeholder="0"
              value={formData.proteins}
              onChange={(e) => handleChange('proteins', e.target.value)}
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="fats">Жиры (г)</Label>
            <Input
              id="fats"
              type="number"
              step="0.1"
              placeholder="0"
              value={formData.fats}
              onChange={(e) => handleChange('fats', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="carbs">Углеводы (г)</Label>
            <Input
              id="carbs"
              type="number"
              step="0.1"
              placeholder="0"
              value={formData.carbs}
              onChange={(e) => handleChange('carbs', e.target.value)}
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>Скоропортящийся продукт</Label>
          <SwitchContainer>
            <Switch>
              <input
                type="checkbox"
                checked={formData.isPerishable}
                onChange={(e) => handleChange('isPerishable', e.target.checked)}
              />
              <span></span>
            </Switch>
            <span>{formData.isPerishable ? 'Да' : 'Нет'}</span>
          </SwitchContainer>
        </FormGroup>

        <FormGroup>
          <Label>Порции продукта *</Label>
          {formData.portions.map((portion, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Input
                type="number"
                step="0.1"
                placeholder="Вес (г)"
                value={portion.weight}
                onChange={(e) => handlePortionChange(index, 'weight', e.target.value)}
                style={{ flex: 1 }}
              />
              <SwitchContainer style={{ flex: 'none' }}>
                <Switch>
                  <input
                    type="checkbox"
                    checked={portion.isDivisible}
                    onChange={(e) => handlePortionChange(index, 'isDivisible', e.target.checked)}
                  />
                  <span></span>
                </Switch>
                <span style={{ fontSize: '0.75rem' }}>
                  {portion.isDivisible ? 'Делить' : 'Целая'}
                </span>
              </SwitchContainer>
              {formData.portions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePortion(index)}
                  style={{
                    padding: '6px 10px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Убрать
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPortion}
            style={{
              padding: '8px 12px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px',
              fontSize: '0.8rem'
            }}
          >
            + Добавить порцию
          </button>
        </FormGroup>

        <Button type="submit">Добавить продукт</Button>
      </Form>

      <ProductGrid>
        {products.length === 0 ? (
          <EmptyState>Добавьте продукты для начала планирования</EmptyState>
        ) : (
          products.map(product => (
            <ProductItem key={product.id}>
              <ProductHeader>
                <ProductTitle>{product.name}</ProductTitle>
                <ProductMeta>
                  {product.packaging && (
                    <MetaTag>
                      {product.packaging}
                    </MetaTag>
                  )}
                  {product.isPerishable && (
                    <MetaTag style={{ background: '#fff3cd', color: '#856404' }}>
                      Скоропортящийся
                    </MetaTag>
                  )}
                </ProductMeta>
              </ProductHeader>

              {product.description && (
                <ProductDescription>{product.description}</ProductDescription>
              )}

              <NutritionGrid>
                <NutritionItem>
                  <NutritionValue>{product.calories}</NutritionValue>
                  <NutritionLabel>ккал</NutritionLabel>
                </NutritionItem>
                <NutritionItem>
                  <NutritionValue>{product.proteins}</NutritionValue>
                  <NutritionLabel>белки (г)</NutritionLabel>
                </NutritionItem>
                <NutritionItem>
                  <NutritionValue>{product.fats}</NutritionValue>
                  <NutritionLabel>жиры (г)</NutritionLabel>
                </NutritionItem>
                <NutritionItem>
                  <NutritionValue>{product.carbs}</NutritionValue>
                  <NutritionLabel>углеводы (г)</NutritionLabel>
                </NutritionItem>
              </NutritionGrid>

              <PortionsSection>
                <PortionsTitle>Доступные порции:</PortionsTitle>
                {product.portions.map((portion, index) => (
                  <PortionItem key={index}>
                    <PortionInfo>
                      <PortionWeight>{portion.weight} г</PortionWeight>
                      <PortionDivisible>
                        {portion.isDivisible ? 'Можно делить' : 'Целая порция'}
                      </PortionDivisible>
                    </PortionInfo>
                  </PortionItem>
                ))}
              </PortionsSection>

              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                <DeleteButton onClick={() => onProductDelete(product.id)}>
                  Удалить продукт
                </DeleteButton>
              </div>
            </ProductItem>
          ))
        )}
      </ProductGrid>
    </Container>
  );
}

export default ProductList;
