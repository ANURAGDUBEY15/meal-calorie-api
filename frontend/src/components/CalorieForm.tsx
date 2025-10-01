import React, { useState } from 'react';
import { api } from '../lib/api';
import { z } from 'zod';
import styles from './CalorieForm.module.scss';
import Autocomplete from './Autocomplete';
import Spinner from './Spinner';

const calorieSchema = z.object({
  dish_name: z.string().min(2),
  servings: z.number().min(1),
});

type CalorieResult = {
  dish_name: string;
  servings: number;
  calories_per_serving: number;
  total_calories: number;
  source: string;
};

interface CalorieFormProps {
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
  darkMode?: boolean;
}

const CalorieForm: React.FC<CalorieFormProps> = ({ setToast, darkMode }) => {
  const [form, setForm] = useState<{ dish_name: string; servings: number }>({ dish_name: '', servings: 1 });
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mealLog, setMealLog] = useState<CalorieResult[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const parsed = calorieSchema.safeParse(form);
    if (!parsed.success) {
      setToast({ type: 'error', message: 'Please enter a valid dish and servings.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setLoading(true);
    try {
      const data = await api('/get-calories', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setResult(data);
      setToast({ type: 'success', message: 'Calories fetched successfully!' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Could not fetch calories');
      setToast({ type: 'error', message: err.message || 'Could not fetch calories' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Example static dish suggestions (can be replaced with API or more data)
  const dishSuggestions = [
    'Chicken Biryani',
    'Paneer Butter Masala',
    'Egg Curry',
    'Dal Tadka',
    'Rajma Chawal',
    'Aloo Paratha',
    'Chole Bhature',
    'Pasta',
    'Pizza',
    'Burger',
    'Salad',
    'Grilled Chicken',
    'Fish Curry',
    'Veg Pulao',
    'Dosa',
    'Idli',
    'Sambar',
    'Upma',
    'Poha',
    'Omelette',
    'Fried Rice',
    'Noodles',
    'Soup',
    'Sandwich',
    'Cheese Toast',
    'Tomato Soup',
    'Chicken Curry',
    'Beef Stir Fry',
    'Pasta with Tomato Sauce',
    'Mixed Green Salad',
    'Rice and Beans',
    'Vegetable Curry',
    'Butter Chicken',
    'Palak Paneer',
    'Mutton Rogan Josh',
    'Kadhi Chawal',
    'Chicken Tikka',
    'Veg Sandwich',
    'Fruit Bowl',
    'Oats Porridge',
    'Pancakes',
    'Waffles',
    'French Toast',
    'Scrambled Eggs',
    'Tofu Stir Fry',
    'Quinoa Salad',
    'Caesar Salad',
    'Greek Salad',
    'Chicken Caesar Wrap',
    'Veggie Burger',
    'Falafel',
    'Shawarma',
    'Burrito',
    'Tacos',
    'Sushi',
    'Ramen',
    'Pho',
    'Spring Rolls',
    'Miso Soup',
    'Kimchi',
    'Bibimbap',
    'Pad Thai',
    'Green Curry',
    'Red Curry',
    'Tom Yum Soup',
    'Chicken Satay',
    'Lentil Soup',
    'Pumpkin Soup',
    'Minestrone',
    'Lasagna',
    'Spaghetti',
    'Mac and Cheese',
    'Risotto',
    'Paella',
    'Gnocchi',
    'Bruschetta',
    'Caprese Salad',
    'Frittata',
    'Shakshuka',
    'Avocado Toast',
    'Granola Bowl',
    'Smoothie',
    'Protein Shake',
    'Energy Bar',
    'Chicken Soup',
    'Vegetable Soup',
    'Cornflakes',
    'Muesli',
    'Porridge',
    'Milkshake',
    'Ice Cream',
    'Brownie',
    'Cupcake',
    'Muffin',
    'Chocolate Cake',
    'Fruit Salad',
    'Apple Pie',
    'Banana Bread',
    'Carrot Cake',
    'Lemon Tart',
    'Cheesecake',
    'Gulab Jamun',
    'Rasgulla',
    'Jalebi',
    'Kheer',
    'Halwa',
    'Barfi',
    'Ladoo',
    'Peda',
    'Sandesh',
    'Rabri',
    'Malpua',
    'Modak',
    'Sheera',
    'Payasam',
    'Basundi',
    'Shrikhand',
    'Phirni',
    'Kulfi',
    'Ice Gola',
    'Falooda',
    'Samosa',
    'Pakora',
    'Bhajiya',
    'Vada Pav',
    'Dabeli',
    'Kachori',
    'Bhel Puri',
    'Pani Puri',
    'Sev Puri',
    'Dhokla',
    'Handwo',
    'Thepla',
    'Undhiyu',
    'Patra',
    'Khandvi',
    'Fafda',
    'Chakli',
    'Murukku',
    'Appam',
    'Puttu',
    'Idiyappam',
    'Neer Dosa',
    'Akki Roti',
    'Ragi Mudde',
    'Bisi Bele Bath',
    'Mysore Pak',
    'Obbattu',
    'Kesari Bath',
    'Rava Dosa',
    'Set Dosa',
    'Bonda',
    'Maddur Vada',
    'Chitranna',
    'Puliyogare',
    'Vangi Bath',
    'Kharabath',
    'Sagu',
    'Kosambari',
    'Avial',
    'Thoran',
    'Olan',
    'Kaalan',
    'Erissery',
    'Pachadi',
    'Kootu',
    'Poriyal',
    'Sambar Rice',
    'Curd Rice',
    'Lemon Rice',
    'Tamarind Rice',
    'Coconut Rice',
    'Tomato Rice',
    'Jeera Rice',
    'Ghee Rice',
    'Peas Pulao',
    'Veg Biryani',
    'Chicken Biryani',
    'Mutton Biryani',
    'Fish Biryani',
    'Egg Biryani',
    'Paneer Biryani',
    'Veg Fried Rice',
    'Chicken Fried Rice',
    'Egg Fried Rice',
    'Prawn Fried Rice',
    'Schezwan Fried Rice',
    'Manchurian',
    'Gobi Manchurian',
    'Paneer Manchurian',
    'Chicken Manchurian',
    'Veg Hakka Noodles',
    'Chicken Hakka Noodles',
    'Egg Hakka Noodles',
    'Prawn Hakka Noodles',
    'Veg Chowmein',
    'Chicken Chowmein',
    'Egg Chowmein',
    'Prawn Chowmein',
    'Veg Spring Roll',
    'Chicken Spring Roll',
    'Egg Spring Roll',
    'Prawn Spring Roll',
    'Veg Momos',
    'Chicken Momos',
    'Paneer Momos',
    'Fried Momos',
    'Steamed Momos',
    'Tandoori Momos',
    'Veg Pizza',
    'Chicken Pizza',
    'Paneer Pizza',
    'Pepperoni Pizza',
    'Margherita Pizza',
    'Farmhouse Pizza',
    'Veggie Supreme Pizza',
    'Deluxe Veggie Pizza',
    'Chicken Supreme Pizza',
    'BBQ Chicken Pizza',
    'Cheese Burst Pizza',
    'Thin Crust Pizza',
    'Stuffed Crust Pizza',
    'Garlic Bread',
    'Cheese Garlic Bread',
    'Stuffed Garlic Bread',
    'Paneer Tikka',
    'Chicken Tikka',
    'Fish Tikka',
    'Seekh Kebab',
    'Shami Kebab',
    'Hara Bhara Kebab',
    'Galouti Kebab',
    'Mutton Kebab',
    'Chicken Kebab',
    'Paneer Kebab',
    'Veg Kebab',
    'Dahi Kebab',
    'Corn Kebab',
    'Aloo Tikki',
    'Ragda Pattice',
    'Pav Bhaji',
    'Misal Pav',
    'Usal Pav',
    'Sabudana Khichdi',
    'Sabudana Vada',
    'Batata Vada',
    'Kanda Poha',
    'Sheera',
    'Puran Poli',
    'Modak',
    'Shrikhand',
    'Basundi',
    'Kharvas',
    'Aliv Kheer',
    'Doodh Pak',
    'Satori',
    'Anarsa',
    'Chirote',
    'Karanji',
    'Laddu',
    'Barfi',
    'Peda',
    'Kalakand',
    'Milk Cake',
    'Rabdi',
    'Malpua',
    'Imarti',
    'Balushahi',
    'Chhena Poda',
    'Chhena Gaja',
    'Ras Malai',
    'Cham Cham',
    'Sandesh',
    'Kheer Kadam',
    'Pantua',
    'Langcha',
    'Nolen Gurer Sandesh',
    'Patishapta',
    'Pithe',
    'Bhapa Doi',
    'Payesh',
    'Sondesh',
    'Mihidana',
    'Sitabhog',
    'Jalbhara Sandesh',
    'Chomchom',
    'Kacha Golla',
    'Kalo Jam',
    'Ledikeni',
    'Malai Sandwich',
    'Malai Roll',
    'Malai Chop',
    'Rasgulla',
    'Gulab Jamun',
    'Kala Jamun',
    'Khoya Barfi',
    'Khoya Peda',
    'Khoya Laddu',
    'Khoya Gujiya',
    'Khoya Kheer',
    'Khoya Halwa',
    'Khoya Modak',
    'Khoya Malpua',
    'Khoya Rabdi',
    'Khoya Basundi',
    'Khoya Shrikhand',
    'Khoya Phirni',
    'Khoya Kulfi',
    'Khoya Ice Cream',
    'Khoya Falooda',
    'Khoya Gajar Halwa',
    'Khoya Lauki Halwa',
    'Khoya Dudhi Halwa',
    'Khoya Moong Dal Halwa',
    'Khoya Besan Halwa',
    'Khoya Badam Halwa',
    'Khoya Coconut Halwa',
    'Khoya Pineapple Halwa',
    'Khoya Mango Halwa',
    'Khoya Apple Halwa',
    'Khoya Banana Halwa',
    'Khoya Papaya Halwa',
    'Khoya Carrot Halwa',
    'Khoya Beetroot Halwa',
    'Khoya Pumpkin Halwa',
    'Khoya Sweet Potato Halwa',
    'Khoya Potato Halwa',
    'Khoya Yam Halwa',
    'Khoya Arbi Halwa',
    'Khoya Taro Halwa',
    'Khoya Colocasia Halwa',
    'Khoya Elephant Foot Yam Halwa',
    'Khoya Suran Halwa',
    'Khoya Zimikand Halwa',
    'Khoya Jimikand Halwa',
    'Khoya Oal Halwa',
    'Khoya Ol Halwa',
    'Khoya Oal ki Sabzi',
    'Khoya Ol ki Sabzi',
    'Khoya Oal Curry',
    'Khoya Ol Curry',
    'Khoya Oal Fry',
    'Khoya Ol Fry',
    'Khoya Oal Bharta',
    'Khoya Ol Bharta',
    'Khoya Oal Chokha',
    'Khoya Ol Chokha',
    'Khoya Oal Tikki',
    'Khoya Ol Tikki',
    'Khoya Oal Cutlet',
    'Khoya Ol Cutlet',
    'Khoya Oal Pakora',
    'Khoya Ol Pakora',
    'Khoya Oal Bhaji',
    'Khoya Ol Bhaji',
    'Khoya Oal Bhujia',
    'Khoya Ol Bhujia',
    'Khoya Oal Chips',
    'Khoya Ol Chips',
    'Khoya Oal Fries',
    'Khoya Ol Fries',
    'Khoya Oal Wafers',
    'Khoya Ol Wafers',
    'Khoya Oal Papad',
    'Khoya Ol Papad',
    'Khoya Oal Chutney',
    'Khoya Ol Chutney',
    'Khoya Oal Pickle',
    'Khoya Ol Pickle',
    'Khoya Oal Raita',
    'Khoya Ol Raita',
    'Khoya Oal Salad',
    'Khoya Ol Salad',
    'Khoya Oal Soup',
    'Khoya Ol Soup',
    'Khoya Oal Juice',
    'Khoya Ol Juice',
    'Khoya Oal Shake',
    'Khoya Ol Shake',
    'Khoya Oal Lassi',
    'Khoya Ol Lassi',
    'Khoya Oal Milkshake',
    'Khoya Ol Milkshake',
    'Khoya Oal Smoothie',
    'Khoya Ol Smoothie',
    'Khoya Oal Ice Cream',
    'Khoya Ol Ice Cream',
    'Khoya Oal Kulfi',
    'Khoya Ol Kulfi',
    'Khoya Oal Falooda',
    'Khoya Ol Falooda',
    'Khoya Oal Rabdi',
    'Khoya Ol Rabdi',
    'Khoya Oal Basundi',
    'Khoya Ol Basundi',
    'Khoya Oal Shrikhand',
    'Khoya Ol Shrikhand',
    'Khoya Oal Phirni',
    'Khoya Ol Phirni',
    'Khoya Oal Kheer',
    'Khoya Ol Kheer',
    'Khoya Oal Payasam',
    'Khoya Ol Payasam',
    'Khoya Oal Basundi',
    'Khoya Ol Basundi',
    'Khoya Oal Shrikhand',
    'Khoya Ol Shrikhand',
    'Khoya Oal Phirni',
    'Khoya Ol Phirni',
    'Khoya Oal Kheer',
    'Khoya Ol Kheer',
    'Khoya Oal Payasam',
    'Khoya Ol Payasam',
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '6vh',
    }}>
      <div className={styles.card + " card mt-5 shadow-lg border-0 rounded-4 p-3 p-md-4 mx-2 mx-md-auto"} style={{ maxWidth: 480, width: '100%', background: darkMode ? '#18181b' : '#fff' }}>
        <form onSubmit={submit} className={styles.form}>
          <h2 className="font-weight-bold text-gradient text-primary mb-1">Calorie Lookup</h2>
          {error && <div className={styles.error}>{error}</div>}
          <Autocomplete
            suggestions={dishSuggestions}
            value={form.dish_name}
            onChange={val => setForm(f => ({ ...f, dish_name: val }))}
            placeholder="Dish Name"
            disabled={loading}
            darkMode={darkMode}
          />
          <input
            className="form-control"
            type="number"
            min={1}
            placeholder="Servings"
            value={form.servings}
            onChange={e => setForm(f => ({ ...f, servings: Number(e.target.value) }))}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading} className={"btn btn-lg btn-primary w-100 text-white shadow-sm mt-2"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Spinner size={22} color="#fff" /> <span>Loading...</span></> : 'Get Calories'}
          </button>
        </form>
        {result && !loading && (
          <div className="card mt-4 shadow-lg border-0 rounded-4 p-4 text-center" style={{ maxWidth: 400, width: '100%', margin: '0 auto', background: darkMode ? '#18181b' : '#fff', color: darkMode ? '#fff' : '#18181b' }}>
            <div className="font-weight-bold text-gradient text-primary mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.dish_name}</div>
            <div className="mb-2">Servings: <span className="font-weight-bold">{result.servings}</span></div>
            <div className="mb-2">Calories per serving: <span className="font-weight-bold">{result.calories_per_serving}</span></div>
            <div className="mb-2">Total calories: <span className="font-weight-bold">{result.total_calories}</span></div>
            <div className="text-xs text-secondary mt-2">Source: {result.source}</div>
            <button
              className="btn btn-success btn-sm mt-3"
              style={{ background: darkMode ? '#363671' : undefined, color: '#fff', border: 'none' }}
              onClick={() => {
                setMealLog(log => [result, ...log]);
                setToast({ type: 'success', message: 'Meal logged!' });
                setTimeout(() => setToast(null), 2000);
              }}
            >Log Meal</button>
          </div>
        )}
        {/* Meal Log/History */}
        {mealLog.length > 0 && (
          <div className="card mt-4 shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: 400, width: '100%', margin: '0 auto', background: darkMode ? '#23234b' : '#f8fafc', color: darkMode ? '#e0e7ff' : '#18181b' }}>
            <h4 className="mb-3" style={{ fontWeight: 700, color: darkMode ? '#fff' : undefined }}>Meal Log</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflowY: 'auto' }}>
              {mealLog.map((meal, idx) => (
                <li key={idx} style={{ borderBottom: '1px solid #4441', padding: '0.5rem 0' }}>
                  <div style={{ fontWeight: 600 }}>{meal.dish_name} <span style={{ fontWeight: 400, fontSize: 13, color: darkMode ? '#a5b4fc' : '#6366f1' }}>({meal.servings} serving{meal.servings > 1 ? 's' : ''})</span></div>
                  <div style={{ fontSize: 13 }}>Total: <b>{meal.total_calories}</b> kcal</div>
                  <div style={{ fontSize: 11, color: darkMode ? '#a5b4fc' : '#6366f1' }}>{meal.source}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalorieForm;
