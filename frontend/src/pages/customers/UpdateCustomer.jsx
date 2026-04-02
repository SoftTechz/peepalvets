import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "../../app/layout/DashboardLayout";
import {
  ArrowLeft,
  ClipboardList,
  PawPrint,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import {
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "@/services/customer_service";
import toast from "react-hot-toast";
import Select from "react-select";
import ModuleHeader from "@/components/ui/ModuleHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

const PET_TYPE_OPTIONS = ["Dog", "Cat", "Rabbit", "Bird", "Reptile", "Other"];

export default function UpdateCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
    petSex: "",
    vaccinated: "",
    vaccinationStartDate: "",
    vaccinationEndDate: "",
    deworming: "",
    dewormingStartDate: "",
    dewormingNextDueDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomerById(customerId);
      const customer = response.customer || {};

      setFormData({
        customerName: customer.name || "",
        email: customer.email || "",
        phoneNumber: customer.phone || "",
        address: customer.address || "",
        petName: customer.petName || "",
        petAgeYears:
          customer.petAgeYears === null || customer.petAgeYears === undefined
            ? customer.petAge === null || customer.petAge === undefined
              ? ""
              : String(Math.floor(Number(customer.petAge)))
            : String(customer.petAgeYears),
        petAgeMonths:
          customer.petAgeMonths === null || customer.petAgeMonths === undefined
            ? customer.petAge === null || customer.petAge === undefined
              ? ""
              : String(Math.round((Number(customer.petAge) % 1) * 12))
            : String(customer.petAgeMonths),
        petType: customer.petType || "",
        petBreed: customer.petBreed || "",
        petSex: customer.petSex || "",
        vaccinated: customer.vaccinated || "",
        vaccinationStartDate: customer.vaccinationStartDate || "",
        vaccinationEndDate: customer.vaccinationEndDate || "",
        deworming: customer.deworming || "",
        dewormingStartDate: customer.dewormingStartDate || "",
        dewormingNextDueDate: customer.dewormingNextDueDate || "",
        notes: customer.notes || "",
      });
    } catch (err) {
      setError("Failed to load patient details");
      console.error("Error fetching patient:", err);
    } finally {
      setLoading(false);
    }
  };

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

    if (
      !formData.petAgeYears.trim() &&
      !formData.petAgeMonths.trim() &&
      (formData.petName.trim() ||
        formData.petType.trim() ||
        formData.petBreed.trim() ||
        formData.petSex.trim())
    ) {
      newErrors.petAgeYears = "Please enter pet age in years or months.";
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
      setSaving(true);
      setError(null);

      const payload = {
        name: formData.customerName,
        email: formData.email.trim(),
        phone: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        petName: formData.petName.trim(),
        petAgeYears: formData.petAgeYears ? Number(formData.petAgeYears) : null,
        petAgeMonths: formData.petAgeMonths
          ? Number(formData.petAgeMonths)
          : null,
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

      await updateCustomer(customerId, payload);
      toast.success("Patient updated successfully");
      navigate("/customers");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: detail || "Phone number already exists.",
        }));
        setError(detail || "Phone number already exists.");
        toast.error(detail || "Phone number already exists.");
      } else {
        setError("Failed to update patient");
        toast.error("Failed to update patient");
      }
      console.error("Error updating patient:", err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this patient? This action cannot be undone.",
      )
    ) {
      try {
        setSaving(true);
        await deleteCustomer(customerId);
        toast.success("Patient deleted successfully");
        navigate("/customers");
      } catch (err) {
        setError("Failed to delete patient");
        toast.error("Failed to delete patient");
        console.error("Error deleting patient:", err);
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 relative">
          <LoadingOverlay
            show={loading || saving}
            message="Saving patient details..."
          />
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <ModuleHeader
            icon={<Users size={22} />}
            title="Update Patient"
            tagline="Edit patient details"
            action={
              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            }
          />

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b border-gray-200 mb-3"></div>

            <div>
              <SectionHeader
                title="Basic Information"
                icon={<ClipboardList size={18} />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Enter owner name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.customerName}
                    </p>
                  )}
                </div>

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
                    placeholder="Enter phone number eg. 9234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

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
                    placeholder="Enter customer address (street, city, state, postal code)"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>
            </div>

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
                    value={
                      formData.petType
                        ? { label: formData.petType, value: formData.petType }
                        : null
                    }
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        petType: selected?.value || "",
                      }))
                    }
                    isClearable
                    isSearchable
                  />
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

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                <Save size={20} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg justify-center"
              >
                <Trash2 size={20} />
                Delete
              </button>
            </div>
          </form>

          {saving && (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
                <p className="text-gray-700 font-semibold text-lg">
                  Updating patient...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
