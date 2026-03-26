import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../app/layout/DashboardLayout";
import { ArrowLeft, CalendarClock, CalendarDays, CalendarPlus } from "lucide-react";
import toast from "react-hot-toast";
import { createAppointment } from "@/services/appointment_service";
import ModuleHeader from "@/components/ui/ModuleHeader";
import SectionHeader from "@/components/ui/SectionHeader";

export default function AddAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);
  const presetCustomerId = searchParams.get("customerId") || "";
  const presetCustomerName = searchParams.get("customerName") || "";
  const presetPhone = searchParams.get("phone") || "";
  const presetPetName = searchParams.get("petName") || "";
  const presetPetAgeYears = searchParams.get("petAgeYears") || "";
  const presetPetAgeMonths = searchParams.get("petAgeMonths") || "";
  const presetPetType = searchParams.get("petType") || "";
  const presetPetSex = searchParams.get("petSex") || "";
  const presetPetBreed = searchParams.get("petBreed") || "";
  const presetVaccinated = searchParams.get("vaccinated") || "";
  const presetDeworming = searchParams.get("deworming") || "";
  const [formData, setFormData] = useState({
    customerId: presetCustomerId,
    customerName: presetCustomerName,
    phone: presetPhone,
    petName: presetPetName,
    petAgeYears: presetPetAgeYears,
    petAgeMonths: presetPetAgeMonths,
    petType: presetPetType,
    petSex: presetPetSex,
    petBreed: presetPetBreed,
    vaccinated: presetVaccinated,
    deworming: presetDeworming,
    vaccinationStartDate: "",
    vaccinationEndDate: "",
    date: today,
    time: currentTime,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.customerId) nextErrors.customerId = "Patient is required.";
    if (!formData.date) nextErrors.date = "Date is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    try {
      const payload = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        phone: formData.phone || null,
        petName: formData.petName || null,
        petAgeYears:
          formData.petAgeYears === "" ? null : Number(formData.petAgeYears),
        petAgeMonths:
          formData.petAgeMonths === "" ? null : Number(formData.petAgeMonths),
        petType: formData.petType || null,
        petSex: formData.petSex || null,
        petBreed: formData.petBreed || null,
        vaccinated: formData.vaccinated || null,
        deworming: formData.deworming || null,
        date: formData.date,
        time: formData.time || null,
      };
      await createAppointment(payload);
      toast.success("Appointment added successfully.");
      navigate("/appointments");
    } catch {
      toast.error("Failed to add appointment.");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <ModuleHeader
            icon={<CalendarDays size={22} />}
            title="Add Appointment"
            tagline="Create an appointment for selected patient"
            action={
              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            }
          />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b border-gray-200 mb-3"></div>

            <div>
              <SectionHeader title="Appointment Information" icon={<CalendarClock size={18} />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                  {errors.customerId && (
                    <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pet Name
                  </label>
                  <input
                    type="text"
                    value={formData.petName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {!formData.customerId && (
                <p className="text-sm text-amber-600 mt-4">
                  Please open this page from the Patients list to select a patient.
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={!formData.customerId}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarPlus size={18} />
                  Add Appointment
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
