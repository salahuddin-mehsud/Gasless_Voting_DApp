import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { usePolls } from '../../hooks/usePolls.js';
import Button from '../ui/Button.jsx';

const CreatePoll = ({ onSuccess }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60); // 60 minutes default
  const [loading, setLoading] = useState(false);
  const { createPoll } = usePolls();

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least two options');
      return;
    }

    setLoading(true);
    
    try {
      const result = await createPoll({
        question: question.trim(),
        options: validOptions,
        durationInMinutes: duration
      });

      if (result.success) {
        setQuestion('');
        setOptions(['', '']);
        setDuration(60);
        if (onSuccess) {
          onSuccess(result.data); // Pass the entire result data, not just poll
        }
      } else {
        alert(result.message || 'Failed to create poll');
      }
    } catch (error) {
      alert('An error occurred while creating the poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Poll Question
          </label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options {options.length < 10 && (
              <span className="text-gray-500 text-xs">(Min: 2, Max: 10)</span>
            )}
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add Option</span>
            </button>
          )}
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            min="1"
            max="43200" // 30 days
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Poll will be active for {Math.floor(duration / 60)} hours {duration % 60} minutes
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full md:w-auto"
          >
            Create Poll
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll;