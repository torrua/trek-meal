import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 24px;
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 500;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const AddButton = styled.button`
  padding: 12px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #218838;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const ProductCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #007acc;
  }
`;

const ProductHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const ProductName = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.2rem;
`;

const ProductMeta = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  padding: 4px 8px;
  background: #e8e8e8;
  color: #555;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ProductBody = styled.div`
  padding: 16px;
`;

const ProductDescription = styled.p`
  color: #666;
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const NutritionItem = styled.div`
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const NutritionValue = styled.div`
  font-weight: 600;
  color: #007acc;
  font-size: 1rem;
`;

const NutritionLabel = styled.div`
  font-size: 0.7rem;
  color: #666;
  margin-top: 2px;
`;

const PortionsSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
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
  border-bottom: 1px solid #e0e0e0;
  
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

const ProductActions = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007acc;
    color: #007acc;
  }
  
  &.delete {
    color: #dc3545;
    border-color: #dc3545;
    
    &:hover {
      background: #dc3545;
      color: white;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.3rem;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
`;

const Form = styled.form`
  display: grid;
  gap: 16px;
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

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &.primary {
    background: #007acc;
    color: white;
    
    &:hover {
      background: #005a9e;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
`;

function Products({ products, onProductAdd, onProductDelete, onProductEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({initialFormData});

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    setEditingProduct(null);
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
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      calories: product.calories || '',
      proteins: product.proteins || '',
      fats: product.fats || '',
      carbs: product.carbs || '',
      isPerishable: product.isPerishable || false,
      packaging: product.packaging || '',
      portions: product.portions || [{ weight: '', isDivisible: false }]
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.portions.some(p => p.weight > 0)) {
      const productData = {
        ...formData,
        calories: parseFloat(formData.calories) || 0,
        proteins: parseFloat(formData.proteins) || 0,
        fats: parseFloat(formData.fats) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        portions: formData.portions.map(p => ({
          ...p,
          weight: parseFloat(p.weight) || 0
        }))
      };

      if (editingProduct) {
        onProductEdit(editingProduct.id, { ...editingProduct, ...productData });
      } else {
        onProductAdd(productData);
      }
      
      setShowModal(false);
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
      <Title>Управление продуктами</Title>
      
      <Header>
        <SearchInput
          type="text"
          placeholder="Поиск продуктов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AddButton onClick={handleAddProduct}>
          + Добавить продукт
        </AddButton>
      </Header>

      {filteredProducts.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>
            {searchTerm ? 'Продукты не найдены' : 'Нет продуктов'}
          </EmptyStateTitle>
          <EmptyStateText>
            {searchTerm 
              ? 'Попробуйте изменить поисковый запрос'
              : 'Добавьте первый продукт для начала работы'
            }
          </EmptyStateText>
          {!searchTerm && (
            <AddButton onClick={handleAddProduct}>
              + Добавить продукт
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <ProductsGrid>
          {filteredProducts.map(product => (
            <ProductCard key={product.id}>
              <ProductHeader>
                <ProductName>{product.name}</ProductName>
                <ProductMeta>
                  {product.packaging && (
                    <MetaTag>{product.packaging}</MetaTag>
                  )}
                  {product.isPerishable && (
                    <MetaTag style={{ background: '#fff3cd', color: '#856404' }}>
                      Скоропортящийся
                    </MetaTag>
                  )}
                </ProductMeta>
              </ProductHeader>

              <ProductBody>
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
              </ProductBody>

              <ProductActions>
                <ActionButton onClick={() => handleEditProduct(product)}>
                  Редактировать
                </ActionButton>
                <ActionButton 
                  className="delete"
                  onClick={() => onProductDelete(product.id)}
                >
                  Удалить
                </ActionButton>
              </ProductActions>
            </ProductCard>
          ))}
        </ProductsGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{editingProduct ? 'Редактировать продукт' : 'Добавить продукт'}</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label htmlFor="name">Название продукта *</Label>
                  <Input id="name" placeholder="Например: Овсянка" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="packaging">Упаковка</Label>
                  <Select id="packaging" value={formData.packaging} onChange={(e) => handleChange('packaging', e.target.value)}>
                    <option value="">Без упаковки</option>
                    <option value="Пакет">Пакет</option>
                    <option value="Банка">Банка</option>
                    <option value="Коробка">Коробка</option>
                    <option value="Бутылка">Бутылка</option>
                  </Select>
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" placeholder="Краткое описание, особенности" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label htmlFor="calories">Калории (на 100г)</Label>
                  <Input id="calories" type="number" step="0.1" placeholder="0" value={formData.calories} onChange={(e) => handleChange('calories', e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="proteins">Белки (на 100г)</Label>
                  <Input id="proteins" type="number" step="0.1" placeholder="0" value={formData.proteins} onChange={(e) => handleChange('proteins', e.target.value)} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label htmlFor="fats">Жиры (на 100г)</Label>
                  <Input id="fats" type="number" step="0.1" placeholder="0" value={formData.fats} onChange={(e) => handleChange('fats', e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="carbs">Углеводы (на 100г)</Label>
                  <Input id="carbs" type="number" step="0.1" placeholder="0" value={formData.carbs} onChange={(e) => handleChange('carbs', e.target.value)} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label>Свойства</Label>
                <SwitchContainer>
                  <Switch>
                    <input type="checkbox" checked={formData.isPerishable} onChange={(e) => handleChange('isPerishable', e.target.checked)} />
                    <span />
                  </Switch>
                  <span>Скоропортящийся продукт</span>
                </SwitchContainer>
              </FormGroup>
              <FormGroup>
                <Label>Порции продукта *</Label>
                {formData.portions.map((portion, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <Input type="text" placeholder="Название порции" value={portion.name} onChange={(e) => handlePortionChange(index, 'name', e.target.value)} style={{ flex: 2 }} required />
                    <Input type="number" step="0.1" placeholder="Вес (г)" value={portion.weight} onChange={(e) => handlePortionChange(index, 'weight', e.target.value)} style={{ flex: 1 }} required />
                    {formData.portions.length > 1 && (
                      <Button type="button" onClick={() => removePortion(index)} style={{ background: '#6c757d' }}>–</Button>
                    )}
                  </div>
                ))}
                <Button type="button" onClick={addPortion} style={{ background: '#28a745', alignSelf: 'flex-start' }}>+ Добавить порцию</Button>
              </FormGroup>
              <ModalActions>
                <Button type="button" className="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
                <Button type="submit" className="primary">{editingProduct ? 'Сохранить' : 'Добавить'}</Button>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default Products;