// pages/index.js
import Head from 'next/head';
import { useState } from 'react';

export default function OnboardingForm() {
  const [formData, setFormData] = useState({
    whatsappNumber: '',
    email: '',
    age: '',
    heightCm: '',
    weightKg: '',
    targetWeightKg: '',
    preferences: '',
    allergies: '',
    vegDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in formData.vegDays) {
      setFormData((prev) => ({
        ...prev,
        vegDays: { ...prev.vegDays, [name]: checked },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Diet Plan Onboarding</title>
      </Head>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Get Started with Your Diet Plan</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">WhatsApp Number</label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              required
              className="mt-1 w-full border px-3 py-2 rounded"
              placeholder="e.g. +91XXXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full border px-3 py-2 rounded"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Height (cm)</label>
              <input
                type="number"
                name="heightCm"
                value={formData.heightCm}
                onChange={handleChange}
                required
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Current Weight (kg)</label>
              <input
                type="number"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                required
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Target Weight (kg)</label>
              <input
                type="number"
                name="targetWeightKg"
                value={formData.targetWeightKg}
                onChange={handleChange}
                required
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Food Preferences</label>
            <input
              type="text"
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              placeholder="e.g. South Indian, Mediterranean"
              className="mt-1 w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Allergies (comma-separated)</label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g. nuts, gluten"
              className="mt-1 w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <span className="block text-sm font-medium">Vegetarian Days</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Object.keys(formData.vegDays).map((day) => (
                <label key={day} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={day}
                    checked={formData.vegDays[day]}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2 capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
          {status === 'success' && (
            <p className="text-green-600 mt-2">Details submitted successfully!</p>
          )}
          {status === 'error' && (
            <p className="text-red-600 mt-2">Submission failed. Please try again.</p>
          )}
        </form>
      </div>
    </>
  );
}
