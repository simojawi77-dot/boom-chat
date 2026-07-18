"use client";

import { useFormContext } from "react-hook-form";
import FormError from "../../components/FormError";
import { useState } from "react";


export default function Step4() {
    const [codeSent, setCodeSent] = useState(false);

  const {
    register,
    formState: { errors },
  } = useFormContext();
  const sendCode = async () => {
    // API Call
    // await axios.post("/api/send-code", { email });

    setCodeSent(true);
  };

  return (
    <div>
      <label htmlFor="email">
        Email <span style={{ color: "red" }}>*</span>
      </label>

      <input
        type="email"
        className={`form-control ${
          errors.email ? "is-invalid" : ""
        }`}
        id="email"
        {...register("email")}
      />
      <button type="button" onClick={sendCode}>
        Send
      </button>

      <FormError
        message={errors.email?.message as string}
      />
    {codeSent && (
        <>
          <label htmlFor="verificationCode">
            Verification Code
          </label>

          <input
            type="text"
            id="verificationCode"
            className="form-control"
            {...register("verificationCode")}
          />
        </>
      )}
    </div>
  );
}