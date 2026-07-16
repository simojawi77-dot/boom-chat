"use client";

import { useFormContext } from "react-hook-form";

export default function Step1() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <h4>Personal Information</h4>

      <div className="form-group">
        <label htmlFor="firstName">
          First Name <span style={{ color: "red" }}>*</span>
        </label>

        <input
          type="text"
          className="form-control"
          id="firstName"
          {...register("firstName")}
        />

        {errors.firstName && (
          <p>{String(errors.firstName.message)}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="lastName">
          Last Name <span style={{ color: "red" }}>*</span>
        </label>

        <input
          type="text"
          className="form-control"
          id="lastName"
          {...register("lastName")}
        />

        {errors.lastName && (
          <p>{String(errors.lastName.message)}</p>
        )}
      </div>
    </div>
  );
}