
"use client";

import { Controller, useFormContext, type UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useWatch } from "react-hook-form";
import { useLanguage } from "@/hooks/use-language";

type CountryCode = '54' | '51' | '52';

interface PhoneNumberInputProps {
    form: UseFormReturn<any>;
    disabled?: boolean;
}

export default function PhoneNumberInput({ form, disabled }: PhoneNumberInputProps) {

    const { t } = useLanguage();
    
    const countryConfig = {
        '54': { name: `${t('Argentina')} (+54)`, description: t('Arg_Phone_Desc') },
        '51': { name: `${t('Peru')} (+51)`, description: t('Peru_Phone_Desc') },
        '52': { name: `${t('Mexico')} (+52)`, description: t('Mex_Phone_Desc') },
    };


    const selectedCountryCode = useWatch({
        control: form.control,
        name: "countryCode",
    }) as CountryCode;

    const description = (countryConfig as any)[selectedCountryCode]?.description || t('Select_Country_Instruction');

    return (
        <FormItem>
            <FormLabel>{t('Phone_Label')}</FormLabel>
            <div className="flex gap-2">
                <Controller
                    name="countryCode"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                            <FormControl>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder={t('Country_Placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(countryConfig).map(([code, { name }]) => (
                                    <SelectItem key={code} value={code}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                <Controller
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                         <FormControl>
                            <Input 
                                placeholder={t('Phone_Placeholder')} 
                                {...field} 
                                disabled={disabled} 
                                type="tel"
                                value={field.value ?? ''}
                            />
                        </FormControl>
                    )}
                />
            </div>
            <FormDescription>
                {description}
            </FormDescription>
            <FormMessage />
        </FormItem>
    );
}

