"use client";

// REVIEWED

import { UserIcon } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";

import signIn7Badge from "../../../../../assets/7th_signin.png";
import badgeFraud from "../../../../../assets/caught_fraud.png";
import verification5Badge from "../../../../../assets/fifth_verification.png";
import verification50Badge from "../../../../../assets/fiftieth_verification.png";
import signIn1Badge from "../../../../../assets/first_signin.png";
import verification1Badge from "../../../../../assets/first_verification.png";
import verification100Badge from "../../../../../assets/one_hundredth_verification.png";
import verification10Badge from "../../../../../assets/tenth_verification.png";
import signIn30Badge from "../../../../../assets/thirty_day_signin.png";
import badgePDFVerified from "../../../../../assets/verified_pdf.png";

const badges = [
  {
    image: signIn1Badge,
    title: "First Sign-in",
    description: "Welcome to our platform",
  },
  {
    image: signIn7Badge,
    title: "7th Sign-in",
    description: "Consistent user for a week",
  },
  {
    image: signIn30Badge,
    title: "30 Day Sign-in",
    description: "Dedicated user for a month",
  },
  {
    image: verification1Badge,
    title: "First Verification",
    description: "Verified your first certificate",
  },
  {
    image: verification5Badge,
    title: "5th Verification",
    description: "Verified 5 certificates",
  },
  {
    image: verification10Badge,
    title: "10th Verification",
    description: "Verified 10 certificates",
  },
  {
    image: verification50Badge,
    title: "50th Verification",
    description: "Verified 50 certificates",
  },
  {
    image: verification100Badge,
    title: "100th Verification",
    description: "Verified 100 certificates",
  },
  {
    image: badgePDFVerified,
    title: "Verified PDF",
    description: "Successfully verified a PDF document",
  },
  {
    image: badgeFraud,
    title: "Fraud Detector",
    description: "Detected fraudulent certificate",
  },
];

export default function ProfilePage() {
  const { isPending, data: user } = useUser();

  if (isPending) {
    return (
      <div className="mx-auto max-w-4xl px-5 lg:px-7">
        <div className="flex items-center justify-center py-12">
          <div className="text-foreground">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-5 lg:px-7">
        <div className="flex items-center justify-center py-12">
          <div className="text-foreground">User not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 lg:px-7">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground md:text-lg">
          Your achievements and account information
        </p>
      </div>

      <div className="space-y-10">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserIcon className="size-8 text-foreground" />
              </div>
              <div className="min-w-0">
                <CardTitle className="w-full text-2xl">
                  <span className="block truncate">{user.name || "User"}</span>
                </CardTitle>
                <CardDescription className="w-full text-base">
                  <span className="block truncate">{user.email}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <p className="text-sm capitalize">
                  {user.role === "issuer-user" ? "Issuer" : "Accredited User"}
                </p>
              </div>
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="text-sm font-medium text-muted-foreground">
                  Account Status
                </label>
                <p className="text-sm">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Achievements & Badges</CardTitle>
            <CardDescription>
              Your accomplishments in certificate verification system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <div
                  key={badge.title}
                  className="flex flex-col items-center gap-2 rounded-lg border p-5 text-center">
                  <div className="mb-2 flex h-16 items-center justify-center">
                    <Image
                      src={badge.image}
                      alt={badge.title}
                      fill
                      className="!static !w-auto"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{badge.title}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-tertiary-2 bg-tertiary-2/10 text-tertiary-2">
                    Unlocked
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>
              Your activity and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">
                  Certificates Issued
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">
                  Certificates Verified
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">
                  Verification Accuracy
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
