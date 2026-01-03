import {
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';
import * as ms from 'ms';
import { StringValue } from 'ms';

@ValidatorConstraint({ name: 'isMsStringValue', async: false })
export class IsMsStringValueConstraint implements ValidatorConstraintInterface {
	validate(val: any, args: ValidationArguments) {
		return typeof val === 'string' && !!ms(val as StringValue);
	}

	defaultMessage(args: ValidationArguments) {
		return '$property should be a time value, e.g., 60 min';
	}
}

export function IsMsStringValue(validationOptions?: ValidationOptions) {
	return function (obj: object, propertyName: string) {
		registerDecorator({
			target: obj.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsMsStringValueConstraint,
		});
	};
}
