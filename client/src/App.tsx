import { useState, useEffect } from 'react'
import './App.css'
import Card from "@/components/card"
import Container from "@/components/container"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"



function App() {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const handleDeleteHabit = async (id: string | number) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await fetch('/api/habits');
        if (!response.ok) {
          throw new Error('Failed to fetch habits');
        }
        const data = await response.json();
        setHabits(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, []);

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    setAdding(true);
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newHabitName,
          description: '', // default value
          // add other default fields as needed
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add habit');
      }
      const createdHabit = await response.json();
      setHabits((prev) => [...prev, createdHabit]);
      setNewHabitName("");
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Container>
      {habits.map((habit, idx) => (
        <Card
          key={habit.id || idx}
          id={habit.id || idx}
          title={habit.name || `Habit ${idx + 1}`}
          description={habit.description || ''}
          onDelete={handleDeleteHabit}
          deleting={deletingId === (habit.id || idx)}
        />
      ))}
      <div className="flex w-full mzax-w-sm items-center gap-2">
        <Input
          type="text"
          placeholder="Do 30 min. of exercise"
          value={newHabitName}
          onChange={e => setNewHabitName(e.target.value)}
          disabled={adding}
        />
        <Button variant="outline" onClick={handleAddHabit} disabled={adding}>
          {adding ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </Container>
  );
}

export default App