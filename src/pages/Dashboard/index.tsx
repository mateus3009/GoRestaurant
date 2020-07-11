import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const { data } = await api.get<IFoodPlate[]>('/foods');
      setFoods(data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { data: newFood } = await api.post<IFoodPlate>('/foods', {
        available: false,
        ...food,
      });
      setFoods(allFoods => [...allFoods, newFood]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { data: updatedFood } = await api.put<IFoodPlate>(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );
      setFoods(AllFoods =>
        AllFoods.map(listedFood => {
          if (listedFood.id === editingFood.id) return updatedFood;
          return listedFood;
        }),
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFoodAvailabilityToggle(id: number): Promise<void> {
    const food = foods.find(foodToFind => foodToFind.id === id);
    if (!food) return;
    food.available = !food.available;
    await api.put(`/foods/${id}`, food);
    setFoods(AllFoods =>
      AllFoods.map(listedFood => {
        if (listedFood.id === editingFood.id) return food;
        return listedFood;
      }),
    );
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    setFoods(AllFoods => AllFoods.filter(food => food.id !== id));
  }

  function toggleModal(): void {
    setModalOpen(status => !status);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleFoodAvailabilityChange={handleFoodAvailabilityToggle}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
