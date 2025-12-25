import {
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'hasNumber', async: false })
export class HasNumberConstraint implements ValidatorConstraintInterface {
	validate(text: string, args: ValidationArguments) {
		return /[0-9]+/.test(text);
	}

	defaultMessage(args: ValidationArguments) {
		return '$property should contain at least 1 number.';
	}
}

export function HasNumber(validationOptions?: ValidationOptions) {
	return function (obj: object, propertyName: string) {
		registerDecorator({
			target: obj.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: HasNumberConstraint,
		});
	};
}
