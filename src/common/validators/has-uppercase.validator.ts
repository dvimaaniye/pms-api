import {
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'hasUppercase', async: false })
export class HasUppercaseConstraint implements ValidatorConstraintInterface {
	validate(text: string, args: ValidationArguments) {
		return /[A-Z]+/.test(text);
	}

	defaultMessage(args: ValidationArguments) {
		return '$property should contain at least 1 uppercase character.';
	}
}

export function HasUppercase(validationOptions?: ValidationOptions) {
	return function (obj: object, propertyName: string) {
		registerDecorator({
			target: obj.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: HasUppercaseConstraint,
		});
	};
}
