import moment from 'moment';
import 'moment/locale/pt-br';

export const editDateFormat = date => {
	if (date === null) return '';
	const day = date.toString().split(' ')[2];
	const mon = (date._d.getMonth() + 1).toString().length === 1 ? `0${date._d.getMonth() + 1}` : date._d.getMonth() + 1;
	const year = date.toString().split(' ')[3];
	return `${year}-${mon}-${day}`;
};

export const editMomentDateFormat = (date, format) => {
	switch (format) {
	default:
	case 'simple':
		return moment(date).year() === moment().year()
			? moment(date).locale('pt-BR').format('D [de] MMMM')
			: moment(date).locale('pt-BR').format('D [de] MMM [de] YYYY');
	}
};

export const editEnviadoEmFormat = date => {
	const enviado_em_local_moment = moment.utc(date)._d;
	const enviado_em_local = moment(enviado_em_local_moment).format();
	const data_hora_resposta_split = enviado_em_local.split('T');
	const enviado_em_view = moment(data_hora_resposta_split[0]).year() === moment().year()
		? moment(data_hora_resposta_split[0]).locale('pt-BR').format('D [de] MMMM')
		: moment(data_hora_resposta_split[0]).locale('pt-BR').format('D [de] MMMM [de] YYYY');
	// const enviado_em_split = data_hora_resposta_split[0].split('-');
	// const enviado_em_view = enviado_em_split[2] !== undefined ? `${enviado_em_split[2]}/${enviado_em_split[1]}` : '-';
	const hora_resposta_split = typeof data_hora_resposta_split[1] === 'string' ? data_hora_resposta_split[1].split(':') : '';
	const hora_resposta_view = hora_resposta_split[0] !== undefined ? `${hora_resposta_split[0]}:${hora_resposta_split[1]}` : '';
	return [enviado_em_view, hora_resposta_view];
};
