import loglevel from 'loglevel';
import type { Logger } from 'loglevel';

const { getLogger: log } = loglevel;

const logger = getLogger('log');
export default logger;

export function getLogger(loggerName: string) {
	const logger = log(loggerName);
	logger.setLevel('INFO');
	setLoggerPrefix(logger);
	return logger;
}

function setLoggerPrefix(logger: Logger) {
	const originalFactory = loglevel.methodFactory;
	logger.methodFactory = function (methodName, logLevel, loggerName) {
		const rawMethod = originalFactory(methodName, logLevel, loggerName);

		return function (...message) {
			rawMethod(...[`[${String(loggerName)}]`, ...message]);
		};
	};
	logger.setLevel(logger.getLevel());
}
