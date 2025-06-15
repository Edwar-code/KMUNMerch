'use client'

import Link from 'next/link'
import React, { useEffect, useState, JSX } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select' 

interface LocationData {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  street: string;
  countryId: string;
  countyId: string;
  cityId: string;
  password: string;
  confirmPassword: string;
}

type Steps = {
  [key: number]: JSX.Element;
}

const RegisterPage = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNumber: '',
    street: '',
    countryId: '',
    countyId: '',
    cityId: '',
    password: '',
    confirmPassword: ''
  })

  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countries, setCountries] = useState<LocationData[]>([])
  const [counties, setCounties] = useState<LocationData[]>([])
  const [cities, setCities] = useState<LocationData[]>([])

  const session = useSession()?.data

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const countriesResponse = await fetch('/api/locations?type=country');
        if (countriesResponse.ok) {
          const countriesData = await countriesResponse.json();
          setCountries(countriesData);
        }

        if (formData.countryId) {
          const countiesResponse = await fetch(`/api/locations?type=county&countryId=${formData.countryId}`);
          if (countiesResponse.ok) {
            const countiesData = await countiesResponse.json();
            setCounties(countiesData);
          }
        }

        if (formData.countyId) {
          const citiesResponse = await fetch(`/api/locations?type=city&countyId=${formData.countyId}`);
          if (citiesResponse.ok) {
            const citiesData = await citiesResponse.json();
            setCities(citiesData);
          }
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, [formData.countryId, formData.countyId])

  if (session) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    if (name === 'password' || name === 'confirmPassword') {
      checkPasswordsMatch(
        name === 'password' ? value : formData.password,
        name === 'confirmPassword' ? value : formData.confirmPassword
      )
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const checkPasswordsMatch = (password: string, confirmPassword: string) => {
    setPasswordsMatch(password === confirmPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) return

    setLoading(true)
    setError(null)

    const submitData = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      countryId: formData.countryId,
      countyId: formData.countyId,
      cityId: formData.cityId,
      street: formData.street,
      password: formData.password,
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/login')
        toast.success('Success!')
      } else {
        const responseData = await response.json()
        setError(responseData.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const steps: Steps = {
    1: (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            placeholder='John Doe'
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder='john@gmail.com'
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            required
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Phone Number
          </label>
          <input
            type="number"
            name="phoneNumber"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder='07 123 45678'
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            required
          />
        </div>
      </div>
    ),
    2: (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Address Information</h2>
        <div>
          <label htmlFor="countryId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Country
          </label>
          <Select
            value={formData.countryId}
            onValueChange={(value) => handleSelectChange('countryId', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="countyId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            County
          </label>
          <Select
            value={formData.countyId}
            onValueChange={(value) => handleSelectChange('countyId', value)}
            disabled={!formData.countryId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select County" />
            </SelectTrigger>
            <SelectContent>
              {counties.map((county) => (
                <SelectItem key={county.id} value={county.id}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="cityId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            City
          </label>
          <Select
            value={formData.cityId}
            onValueChange={(value) => handleSelectChange('cityId', value)}
            disabled={!formData.countyId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="street" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Street Name
          </label>
          <input
            type="text"
            name="street"
            id="street"
            value={formData.street}
            onChange={handleInputChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            required
          />
        </div>
      </div>
    ),
        3: (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="********"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="********"
              className={`bg-gray-50 border ${passwordsMatch ? 'border-gray-300' : 'border-red-500'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {!passwordsMatch && <p className="text-red-500 text-sm">Passwords do not match</p>}
        </div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-light text-gray-500">
              I accept the <Link className="font-medium text-primary-600 hover:underline" href="/terms-and-conditions">Terms and Conditions</Link> and <Link className="font-medium text-primary-600 hover:underline" href="/privacy-policy">Privacy Policy</Link>
            </label>
          </div>
        </div>
      </div>
    ),
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.name && formData.email && formData.phoneNumber)
      case 2:
        return Boolean(formData.countryId && formData.countyId && formData.cityId && formData.street)
      case 3:
        return Boolean(formData.password && formData.confirmPassword && passwordsMatch)
      default:
        return false
    }
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen">
        <Link href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          Avenue Fashion
        </Link>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create an account
            </h1>
            
            {/* Progress indicator */}
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === step
                      ? 'bg-primary-600 text-white'
                      : currentStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {steps[currentStep as keyof typeof steps]}

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <div className="flex justify-between mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => validateStep(currentStep) && setCurrentStep(currentStep + 1)}
                    disabled={!validateStep(currentStep)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 ml-auto"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !validateStep(currentStep)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 ml-auto">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>
            </form>

            {/* Google One Tap Login */}
            <div className="mt-4">
              <div id="g_id_onload"
                data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                data-context="use"
                data-ux_mode="popup"
                data-login_uri="http://avenuefashion.co.ke/api/auth/callback/google"
                data-nonce=""
                data-itp_support="true"
              >
              </div>

              <div className="g_id_signin"
                data-type="standard"
                data-shape="pill"
                data-theme="outline"
                data-text="continue_with"
                data-size="large"
                data-logo_alignment="left"
              >
              </div>
            </div>

            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage
