import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../app/layout/DashboardLayout";
import {
  ArrowLeft,
  ClipboardList,
  PawPrint,
  UserPlus,
  Users,
} from "lucide-react";
import { createCustomer } from "../../services/customer_service";
import toast from "react-hot-toast";
import Select from "react-select";
import ModuleHeader from "@/components/ui/ModuleHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

const PET_TYPE_OPTIONS = ["Dog", "Cat", "Rabbit", "Bird", "Reptile", "Other"];

export default function AddCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    address: "",
    petName: "",
    petAgeYears: "",
    petAgeMonths: "",
    petType: "",
    petBreed: "",
    petSex: "Male",
    vaccinated: "No",
    vaccinationStartDate: "",
    vaccinationEndDate: "",
    deworming: "No",
    dewormingStartDate: "",
    dewormingNextDueDate: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Patient name is required.";
    }

    if (
      formData.phoneNumber.trim() &&
      !/^\d{10}$/.test(formData.phoneNumber.trim())
    ) {
      newErrors.phoneNumber = "Phone number must be 10 digits.";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (
      formData.petAgeYears.trim() &&
      (!/^\d+$/.test(formData.petAgeYears.trim()) ||
        Number(formData.petAgeYears) < 0)
    ) {
      newErrors.petAgeYears =
        "Pet age (years) must be a valid non-negative number.";
    }

    if (
      formData.petAgeMonths.trim() &&
      (!/^\d+$/.test(formData.petAgeMonths.trim()) ||
        Number(formData.petAgeMonths) < 0 ||
        Number(formData.petAgeMonths) > 11)
    ) {
      newErrors.petAgeMonths = "Pet age (months) must be between 0 and 11.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.customerName,
        email: formData.email.trim(),
        phone: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        petName: formData.petName.trim(),
        petAgeYears: formData.petAgeYears ? Number(formData.petAgeYears) : 0,
        petAgeMonths: formData.petAgeMonths ? Number(formData.petAgeMonths) : 0,
        petType: formData.petType.trim(),
        petBreed: formData.petBreed.trim(),
        petSex: formData.petSex,
        vaccinated: formData.vaccinated.trim(),
        vaccinationStartDate:
          formData.vaccinated === "Yes"
            ? formData.vaccinationStartDate || null
            : null,
        vaccinationEndDate:
          formData.vaccinated === "Yes"
            ? formData.vaccinationEndDate || null
            : null,
        deworming: formData.deworming.trim(),
        dewormingStartDate:
          formData.deworming === "Yes"
            ? formData.dewormingStartDate || null
            : null,
        dewormingNextDueDate:
          formData.deworming === "Yes"
            ? formData.dewormingNextDueDate || null
            : null,
        notes: formData.notes.trim(),
      };
      console.log("Submitting Customer Payload:", payload);
      await createCustomer(payload);
      toast.success("Patient added successfully 🎉");
      navigate("/customers");
    } catch (error) {
      console.error("Error creating customer:", error);
      const detail = error?.response?.data?.detail;
      if (error?.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: detail || "Phone number already exists.",
        }));
        toast.error(detail || "Phone number already exists.");
      } else {
        toast.error("Failed to add patient. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 relative">
          <LoadingOverlay show={loading} message="Creating patient..." />
          <ModuleHeader
            icon={<Users size={22} />}
            title="Add New Patient"
            tagline="Create a new patient profile"
            action={
              <button
                type="button"
                onClick={() => navigate("/customers")}
                disabled={loading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            }
          />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b border-gray-200 mb-3"></div>
            {/* Basic Information Section */}
            <div>
              <SectionHeader
                title="Basic Information"
                icon={<ClipboardList size={18} />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name Field */}
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter Owner name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    maxLength="10"
                    required
                    placeholder="Enter phone number eg. 9234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Address Field - Full width */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter Owner address (street, city, state, postal code)"
                    rows="3"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pet Information Section */}
            <div>
              <SectionHeader
                title="Pet Information"
                icon={<PawPrint size={18} />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="petName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Pet Name
                  </label>
                  <input
                    type="text"
                    id="petName"
                    name="petName"
                    value={formData.petName}
                    onChange={handleChange}
                    placeholder="Enter pet name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.petName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.petName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="petAgeYears"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Pet Age (Years)
                  </label>
                  <input
                    type="number"
                    id="petAgeYears"
                    name="petAgeYears"
                    value={formData.petAgeYears}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter pet age in years"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.petAgeYears && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.petAgeYears}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="petAgeMonths"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Pet Age (Months)
                  </label>
                  <input
                    type="number"
                    id="petAgeMonths"
                    name="petAgeMonths"
                    value={formData.petAgeMonths}
                    onChange={handleChange}
                    min="0"
                    max="11"
                    placeholder="Enter pet age in months"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.petAgeMonths && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.petAgeMonths}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="petType"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Species
                  </label>
                  <Select
                    options={PET_TYPE_OPTIONS.map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        petType: selected?.value,
                      }))
                    }
                  />
                  {errors.petType && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.petType}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="petBreed"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Breed
                  </label>
                  <input
                    type="text"
                    id="petBreed"
                    name="petBreed"
                    value={formData.petBreed}
                    onChange={handleChange}
                    placeholder="Enter pet breed"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sex
                  </label>
                  <div className="flex items-center gap-6 px-4 py-3 border border-gray-300 rounded-lg">
                    {["Male", "Female", "Unknown"].map((sex) => (
                      <label
                        key={sex}
                        className="inline-flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="radio"
                          name="petSex"
                          value={sex}
                          checked={formData.petSex === sex}
                          onChange={handleChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        {sex}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vaccination Status
                  </label>
                  <div className="flex items-center gap-6 px-4 py-3 border border-gray-300 rounded-lg">
                    {["Yes", "No"].map((option) => (
                      <label
                        key={option}
                        className="inline-flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="radio"
                          name="vaccinated"
                          value={option}
                          checked={formData.vaccinated === option}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "No") {
                              setFormData((prev) => ({
                                ...prev,
                                vaccinated: value,
                                vaccinationStartDate: "",
                                vaccinationEndDate: "",
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                vaccinated: value,
                              }));
                            }
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                {formData.vaccinated === "Yes" && (
                  <>
                    <div>
                      <label
                        htmlFor="vaccinationStartDate"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Vaccination Date
                      </label>
                      <input
                        type="date"
                        id="vaccinationStartDate"
                        name="vaccinationStartDate"
                        value={formData.vaccinationStartDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                      {errors.vaccinationStartDate && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.vaccinationStartDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="vaccinationEndDate"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Vaccination Next Due Date
                      </label>
                      <input
                        type="date"
                        id="vaccinationEndDate"
                        name="vaccinationEndDate"
                        value={formData.vaccinationEndDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                      {errors.vaccinationEndDate && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.vaccinationEndDate}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deworming
                  </label>
                  <div className="flex items-center gap-6 px-4 py-3 border border-gray-300 rounded-lg">
                    {["Yes", "No"].map((option) => (
                      <label
                        key={option}
                        className="inline-flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="radio"
                          name="deworming"
                          value={option}
                          checked={formData.deworming === option}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "No") {
                              setFormData((prev) => ({
                                ...prev,
                                deworming: value,
                                dewormingStartDate: "",
                                dewormingNextDueDate: "",
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                deworming: value,
                              }));
                            }
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                {formData.deworming === "Yes" && (
                  <>
                    <div>
                      <label
                        htmlFor="dewormingStartDate"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Deworming Start Date
                      </label>
                      <input
                        type="date"
                        id="dewormingStartDate"
                        name="dewormingStartDate"
                        value={formData.dewormingStartDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                      {errors.dewormingStartDate && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.dewormingStartDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="dewormingNextDueDate"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Deworming Next Due Date
                      </label>
                      <input
                        type="date"
                        id="dewormingNextDueDate"
                        name="dewormingNextDueDate"
                        value={formData.dewormingNextDueDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      />
                      {errors.dewormingNextDueDate && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.dewormingNextDueDate}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add special care instructions, medical history, allergies, etc."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus size={18} />
                  Add Patient
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
