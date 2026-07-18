"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/registerSchema";
import { z } from "zod";
import { useState } from "react";

import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";

type RegisterData = z.infer<typeof registerSchema>;

const Register = () => {
  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const { trigger } = form;

  const [step, setStep] = useState(1);


  const nextStep = async () => {
    let fields: (keyof RegisterData)[] = [];


    if (step === 1) {
      fields = [
        "firstName",
        "lastName",
      ];
    }


    if (step === 2) {
      fields = [
        "dateOfBirth",
        "gender",
        "city",
      ];
    }


    if (step === 3) {
      fields = [
        "password",
        "confirmPassword",
      ];
    }


    if (step === 4) {
      fields = [
        "email",
      ];
    }


    if (step === 5) {
      fields = [
        "phone",
      ];
    }


    const isValid = await trigger(fields);


    if (!isValid) {
      return;
    }


    setStep((prev) => prev + 1);
  };


  return (
    <>
      <div>
        <FormProvider {...form} onSubmit={hundlesubmit}>
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
        </FormProvider>
      </div>


      <div>
        {step < 5 && (
          <button onClick={nextStep}>
            Next
          </button>
        )}
        {step === 5 && (
          <button>
            Submit
          </button>
        )}


        {step !== 1 && (
          <button
            onClick={() =>
              setStep((prev) => prev - 1)
            }
          >
            Previous
          </button>
        )}
      </div>
    </>
  );
};

export default Register;