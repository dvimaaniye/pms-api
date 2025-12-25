import {
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'hasLowercase', async: false })
export class HasLowercaseConstraint implements ValidatorConstraintInterface {
	validate(text: string, args: ValidationArguments) {
		return /[a-z]+/.test(text);
	}

	defaultMessage(args: ValidationArguments) {
		return '$property should contain at least 1 lowercase character.';
	}
}

export function HasLowercase(validationOptions?: ValidationOptions) {
	return function (obj: object, propertyName: string) {
		registerDecorator({
			target: obj.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: HasLowercaseConstraint,
		});
	};
}
