import loglevel from 'loglevel';
import type { Logger } from 'loglevel';

const { getLogger } = loglevel;

const logger = getLogger('site');
logger.setLevel('INFO');
setLoggerPrefix(logger);
export default logger;

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
