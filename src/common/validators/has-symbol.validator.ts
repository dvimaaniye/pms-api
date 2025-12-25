import {
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'hasSymbol', async: false })
export class HasSymbolConstraint implements ValidatorConstraintInterface {
	validate(text: string, args: ValidationArguments) {
		return /[!@#$%^&*(),.?":{}|<>]+/.test(text);
	}

	defaultMessage(args: ValidationArguments) {
		return '$property should contain at least 1 symbol.';
	}
}

export function HasSymbol(validationOptions?: ValidationOptions) {
	return function (obj: object, propertyName: string) {
		registerDecorator({
			target: obj.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: HasSymbolConstraint,
		});
	};
}
