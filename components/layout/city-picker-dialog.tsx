"use client";

import * as React from "react";
import { MapPin, Navigation } from "lucide-react";
import { useCity } from "@/lib/city";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function CityPickerDialog() {
  const { cities, cityId, pickerOpen, selectCity, closePicker } = useCity();
  const [selected, setSelected] = React.useState<string>("");
  const [locationRequested, setLocationRequested] = React.useState(false);

  React.useEffect(() => {
    if (pickerOpen) setSelected(cityId ?? "");
  }, [pickerOpen, cityId]);

  function handleAllowLocation() {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationRequested(true),
        () => setLocationRequested(true)
      );
    } else {
      setLocationRequested(true);
    }
  }

  function handleContinue() {
    if (selected) selectCity(selected);
  }

  return (
    <Dialog open={pickerOpen} onOpenChange={(open) => !open && closePicker()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" /> See prices for your city
          </DialogTitle>
          <DialogDescription>
            Prices may vary by location. Allow location access or pick your city to see accurate pricing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button type="button" variant="outline" onClick={handleAllowLocation} className="justify-center">
            <Navigation className="size-4" />
            {locationRequested ? "Location access requested" : "Allow Location Access"}
          </Button>

          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" onClick={handleContinue} disabled={!selected}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
