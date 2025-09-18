"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useDoctorsForScheduling } from "@/hooks/useScheduleService";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  Coffee,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { format, startOfToday } from "date-fns";
import { tr } from "date-fns/locale";

const daysOfWeek = [
  { id: "MONDAY", label: "Pazartesi" },
  { id: "TUESDAY", label: "Salı" },
  { id: "WEDNESDAY", label: "Çarşamba" },
  { id: "THURSDAY", label: "Perşembe" },
  { id: "FRIDAY", label: "Cuma" },
  { id: "SATURDAY", label: "Cumartesi" },
  { id: "SUNDAY", label: "Pazar" },
] as const;

export function ScheduleForm() {
  const form = useFormContext();
  const { data: doctors, isLoading: doctorsLoading } =
    useDoctorsForScheduling();
  const watchedValues = form.watch();

  return (
    <Card className="lg:col-span-2 bg-card">
      <CardHeader>
        <CardTitle>Doktor Takvimi Oluşturma</CardTitle>
        <CardDescription>
          Seçilen doktor için belirtilen aralıkta otomatik randevu takvimi
          oluşturun.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Temel Bilgiler
          </h3>
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doktor</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? doctors?.find((d) => d.doctorId === field.value)
                              ?.user.firstName +
                            " " +
                            doctors?.find((d) => d.doctorId === field.value)
                              ?.user.lastName
                          : "Bir doktor seçin"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Doktor ara..." />
                      <CommandList>
                        <CommandEmpty>Doktor bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {doctorsLoading ? (
                            <p className="p-2 text-sm">Yükleniyor...</p>
                          ) : (
                            doctors?.map((doctor) => (
                              <CommandItem
                                value={`${doctor.user.firstName} ${doctor.user.lastName}`}
                                key={doctor.doctorId}
                                onSelect={() =>
                                  form.setValue("doctorId", doctor.doctorId)
                                }
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === doctor.doctorId
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {doctor.user.firstName} {doctor.user.lastName}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tarih Aralığı</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y", {
                              locale: tr,
                            })}{" "}
                            -{" "}
                            {format(field.value.to, "LLL dd, y", {
                              locale: tr,
                            })}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Bir tarih aralığı seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={field.value}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                      locale={tr}
                      disabled={(date) => date < startOfToday()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Çalışma Gün ve Saatleri
          </h3>
          <FormField
            control={form.control}
            name="workDays"
            render={() => (
              <FormItem>
                <FormLabel>Çalışma Günleri</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  {daysOfWeek.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="workDays"
                      render={({ field }) => (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value || []),
                                      item.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value: string) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="workStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlangıç Saati</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workEndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bitiş Saati</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="space-y-4 p-4 border rounded-lg">
          <FormField
            control={form.control}
            name="addLunchBreak"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-lg flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-primary" />
                    Öğle Molası Ekle
                  </FormLabel>
                  <FormDescription>
                    Takvime öğle molası aralığı ekleyin.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {watchedValues.addLunchBreak && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <FormField
                control={form.control}
                name="lunchStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mola Başlangıç</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lunchEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mola Bitiş</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <Separator />
          <FormField
            control={form.control}
            name="slotDurationInMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary" />
                  Randevu Aralığı (Dakika)
                </FormLabel>
                <Select
                  onValueChange={(value: string) =>
                    field.onChange(parseInt(value))
                  }
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bir aralık seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="15">15 Dakika</SelectItem>
                    <SelectItem value="20">20 Dakika</SelectItem>
                    <SelectItem value="30">30 Dakika</SelectItem>
                    <SelectItem value="45">45 Dakika</SelectItem>
                    <SelectItem value="60">60 Dakika</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
