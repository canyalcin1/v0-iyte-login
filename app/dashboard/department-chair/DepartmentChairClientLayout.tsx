"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, FileSignature, AlertTriangle, Loader2, Calendar, User, BookOpen, Eye } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { signCoverLetter, type CoverLetter } from "@/app/actions/department-chair"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DepartmentChairClientLayoutProps {
  userName: string
  coverLetters: CoverLetter[]
  error?: string | null
}

export default function DepartmentChairClientLayout({
  userName,
  coverLetters: initialCoverLetters,
  error: initialError,
}: DepartmentChairClientLayoutProps) {
  const [coverLetters, setCoverLetters] = useState(initialCoverLetters)
  const [isSigningCoverLetter, setIsSigningCoverLetter] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(initialError || null)
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetter | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showSignModal, setShowSignModal] = useState(false)

  const handleSignCoverLetter = async (entryId: string) => {
    setIsSigningCoverLetter(entryId)
    setActionError(null)

    try {
      const result = await signCoverLetter(entryId)
      if (result.success) {
        alert(result.data.message || "Cover letter signed successfully and forwarded to Faculty Secretary!")
        // Remove the signed cover letter from the list
        setCoverLetters((prev) => prev.filter((letter) => letter.entryId !== entryId))
        setShowSignModal(false)
        setSelectedCoverLetter(null)
      } else {
        setActionError(result.error || "Failed to sign cover letter")
      }
    } catch (error) {
      setActionError("An unexpected error occurred while signing the cover letter")
    } finally {
      setIsSigningCoverLetter(null)
    }
  }

  const openSignModal = (coverLetter: CoverLetter) => {
    setSelectedCoverLetter(coverLetter)
    setActionError(null)
    setShowSignModal(true)
  }

  const getStatusBadge = (stage: string) => {
    const stageConfig = {
      PENDING_DEPARTMENT_CHAIR: { color: "bg-orange-100 text-orange-800", text: "Pending Your Signature" },
      PENDING_FACULTY_SECRETARY: { color: "bg-blue-100 text-blue-800", text: "Sent to Faculty Secretary" },
      PENDING_STUDENT_AFFAIRS: { color: "bg-purple-100 text-purple-800", text: "At Student Affairs" },
      COMPLETED: { color: "bg-green-100 text-green-800", text: "Completed" },
    }
    const config = stageConfig[stage as keyof typeof stageConfig] || {
      color: "bg-gray-100 text-gray-800",
      text: "Unknown",
    }
    return <Badge className={config.color}>{config.text}</Badge>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="IYTE Logo"
              width={40}
              height={40}
              className="rounded-full hidden sm:block"
            />
            <h1 className="text-xl font-bold">Department Chair Portal</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {userName}</span>
          <form action={logout}>
            <Button variant="outline" className="text-white bg-[#990000] border-white hover:bg-white/10" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Department Chair Dashboard</h2>
          <p className="text-gray-600">Review and sign cover letters for graduation applications</p>
        </div>

        {actionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {/* Summary Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileSignature className="w-12 h-12 text-blue-500" />
                <div>
                  <h3 className="text-2xl font-bold">{coverLetters.length}</h3>
                  <p className="text-gray-600">Cover Letters Pending Signature</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Ready for your review and signature</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Letters for Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-500" />
              Cover Letters for Signature
            </CardTitle>
            <CardDescription>Review and sign cover letters prepared by the Department Secretary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coverLetters.map((letter) => (
                <div key={letter.entryId} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          {letter.studentName} {letter.studentLastName}
                        </h3>
                        {getStatusBadge(letter.stage)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Student ID</p>
                            <p className="font-medium">{letter.studentId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Department</p>
                            <p className="font-medium">{letter.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Graduation Date</p>
                            <p className="font-medium">{new Date(letter.graduationDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">GPA</p>
                          <p className="font-medium text-lg">{letter.gpa.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Credits Earned</p>
                          <p className="font-medium text-lg">{letter.creditsEarned}</p>
                        </div>
                      </div>

                      {letter.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Notes:</p>
                          <p className="text-sm">{letter.notes}</p>
                        </div>
                      )}

                      <div className="text-sm text-gray-500">
                        <p>Cover letter generated: {new Date(letter.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCoverLetter(letter)
                        setShowDetailsModal(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>

                    {letter.stage === "PENDING_DEPARTMENT_CHAIR" && !letter.departmentChairSigned && (
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                        onClick={() => openSignModal(letter)}
                        disabled={isSigningCoverLetter === letter.entryId}
                      >
                        {isSigningCoverLetter === letter.entryId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        {isSigningCoverLetter === letter.entryId ? "Signing..." : "Sign & Forward"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {coverLetters.length === 0 && (
                <div className="text-center py-12">
                  <FileSignature className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Cover Letters Pending</h3>
                  <p className="text-gray-500">All cover letters have been signed and forwarded.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Other Actions */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Other Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
                <h3 className="font-medium mb-2">View Graduation Reports</h3>
                <p className="text-sm text-gray-600">Access departmental graduation statistics.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Cover Letter Details Modal */}
      {selectedCoverLetter && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Cover Letter Details - {selectedCoverLetter.studentName} {selectedCoverLetter.studentLastName}
              </DialogTitle>
              <DialogDescription>Complete information about this cover letter</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Student ID</p>
                  <p className="text-sm">{selectedCoverLetter.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Department</p>
                  <p className="text-sm">{selectedCoverLetter.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">GPA</p>
                  <p className="text-sm">{selectedCoverLetter.gpa.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Credits Earned</p>
                  <p className="text-sm">{selectedCoverLetter.creditsEarned}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedCoverLetter.stage)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Graduation Date</p>
                  <p className="text-sm">{new Date(selectedCoverLetter.graduationDate).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedCoverLetter.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedCoverLetter.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-600">Cover Letter Generated</p>
                <p className="text-sm">{new Date(selectedCoverLetter.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Sign Cover Letter Modal */}
      {selectedCoverLetter && (
        <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSignature className="w-5 h-5" />
                Sign Cover Letter
              </DialogTitle>
              <DialogDescription>
                Sign the cover letter for {selectedCoverLetter.studentName} {selectedCoverLetter.studentLastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">Student</p>
                <p className="text-sm">
                  {selectedCoverLetter.studentName} {selectedCoverLetter.studentLastName} (
                  {selectedCoverLetter.studentId})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm">{selectedCoverLetter.department}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">GPA</p>
                  <p className="text-sm">{selectedCoverLetter.gpa.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Credits</p>
                  <p className="text-sm">{selectedCoverLetter.creditsEarned}</p>
                </div>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  By signing this cover letter, you confirm that the student has met all departmental requirements for
                  graduation. The cover letter will be forwarded to the Faculty Secretary for the next step.
                </AlertDescription>
              </Alert>
              {actionError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSignModal(false)}
                disabled={isSigningCoverLetter !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedCoverLetter && handleSignCoverLetter(selectedCoverLetter.entryId)}
                disabled={isSigningCoverLetter !== null}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {isSigningCoverLetter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign & Forward to Faculty Secretary
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>© {new Date().getFullYear()} IYTE Graduation Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}
