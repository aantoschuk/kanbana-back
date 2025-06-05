import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDTO {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    password: string;
}
