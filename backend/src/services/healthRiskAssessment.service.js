export const healthRiskAssessment = (data)=>{

    let score = 0;

    if(data.medical_condition?.trim()){
        score +=2
    }

    if(data.current_medication?.trim()){
        score +=1
    }

    if(data.allergies?.trim()){
        score +=1
    }

    if(data.injury_history?.trim()){
        score +=1
    }

    if(data.exercise_restriction?.trim()){
        score +=2
    }
    if(data.doctor_clearance===false){
        score +=2
    }

    if(score<=2){
        return "low"
    }

    if(score<=4){
        return "medium"
    }

    return "high"
}