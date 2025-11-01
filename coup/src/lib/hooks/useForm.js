import { useState, useCallback } from 'react';

export const useForm = (initialState, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (callback) => {
    setIsSubmitting(true);
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      await callback();
    }
    setIsSubmitting(false);
  }, [values, validate]);

  return {
    values,
    setValues,
    errors,
    setErrors,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};
