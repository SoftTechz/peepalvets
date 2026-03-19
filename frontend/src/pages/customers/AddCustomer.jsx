import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../app/layout/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import { createCustomer } from "../../services/customer_service";
import toast from "react-hot-toast";
import Select from "react-select";

const PET_TYPE_OPTIONS = ["Dog", "Cat", "Rabbit", "Bird", "Reptile", "Other"];

export default function AddCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    address: "",
    petName: "",
    petAge: "",
    petType: "",
    petBreed: "",
    petSex: "",
    petWeight: "",
    vaccinated: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

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
      formData.petAge.trim() &&
      (!/^\d+$/.test(formData.petAge.trim()) || Number(formData.petAge) <= 0)
    ) {
      newErrors.petAge = "Pet age must be a valid positive number.";
    }

    if (formData.petWeight.trim() && Number(formData.petWeight) <= 0) {
      newErrors.petWeight = "Pet weight must be greater than zero.";
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
      const payload = {
        name: formData.customerName,
        email: formData.email.trim(),
        phone: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        petName: formData.petName.trim(),
        petAge: formData.petAge ? Number(formData.petAge) : null,
        petType: formData.petType.trim(),
        petBreed: formData.petBreed.trim(),
        petSex: formData.petSex,
        petWeight: formData.petWeight ? Number(formData.petWeight) : null,
        vaccinated: formData.vaccinated.trim(),
        notes: formData.notes.trim(),
      };
      console.log("Submitting Customer Payload:", payload);
      await createCustomer(payload);
      toast.success("Patient added successfully 🎉");
      navigate("/customers");
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to add patient. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Center the Heading and underline */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-800">
                Add New Patient
              </h1>
              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
            <div className="border-b border-gray-200 mb-3"></div>
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name Field */}
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter patient name"
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
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    maxLength="10"
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
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter customer address (street, city, state, postal code)"
                    rows="3"
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
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Pet Information
              </h2>
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
                    htmlFor="petAge"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Pet Age (years)
                  </label>
                  <input
                    type="number"
                    id="petAge"
                    name="petAge"
                    value={formData.petAge}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter pet age"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.petAge && (
                    <p className="text-sm text-red-500 mt-1">{errors.petAge}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="petType"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Pet Type
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

                <div>
                  <label
                    htmlFor="petWeight"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="petWeight"
                    name="petWeight"
                    value={formData.petWeight}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="Enter weight"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.petWeight && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.petWeight}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="vaccinated"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Vaccination Status
                  </label>
                  <input
                    type="text"
                    id="vaccinated"
                    name="vaccinated"
                    value={formData.vaccinated}
                    onChange={handleChange}
                    placeholder="e.g., up-to-date, due, not vaccinated"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

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
                Add Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
