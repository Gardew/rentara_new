import {useEffect} from "react";
import {useLoginMutation} from "../../services/api/authApi.js";

import {Card, CardContent, CardHeader} from "../ui/card.tsx";
import {AiFillRocket} from "react-icons/ai";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "../ui/form.tsx";


import {z} from "zod";
import {useForm} from "react-hook-form";
import {Input} from "../ui/input.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "../ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {KeyRound} from "lucide-react";
import { useTranslation } from 'react-i18next';

const LoginCard = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const [login, {isLoading}] = useLoginMutation();


    const loginFormSchema = z.object({
        email: z.string().email( {message: t('auth.errors.email')}),
        password: z.string().min(8, {message: t('auth.errors.passwordMin')}),
    })

    const form = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    function onSubmit(zodValues) {
        login(zodValues).then((res) => {
            if (res.data) {
                navigate('/')
            }
        })
    }

    return (
        <div className="flex justify-center items-center min-h-screen rounded-xl shadow-inner">
            <Card className="shadow-2xl  flex w-fit flex-col p-5">
                <CardHeader className="flex justify-center items-center py-10">
                <img 
                        src="/icon.png" 
                        alt="App Logo"
                        className="w-6 h-6 flex justify-center"
                    />
                    <h1 className="text-3xl">{t('auth.welcomeBack')}</h1>
                    
                </CardHeader>
                    <CardContent className="w-[275px] md:w-[350px]">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-3 w-[100%] ">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem >
                                            <FormLabel>{t('auth.email')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('auth.emailPlaceholder')} {...field} />
                                            </FormControl>
                                            <FormDescription hidden>{t('auth.errors.enterEmail')}</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{t('auth.password')}</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormDescription hidden>{t('auth.errors.enterPassword')}</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <Button variant="link" type="button" onClick={() => navigate("/signup")}>
                                    {t('auth.noAccount')}
                                </Button>
                                <Button type="submit" variant="dark" isLoading={isLoading}>
                                    {t('auth.login')}
                                </Button>
                            </form>
                        </Form>

                    </CardContent>

            </Card>
        </div>
    )
}

export default LoginCard;