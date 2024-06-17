# myapp/views.py

from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from joblib import load
import json,requests

# Load your models and vectorizers
presence_classifier = load('presence_classifier.joblib')
presence_vect = load('presence_vectorizer.joblib')
category_classifier = load('category_classifier.joblib')
category_vect = load('category_vectorizer.joblib')

@csrf_exempt
def main(request):
    
    if request.method == 'POST':

        data = json.loads(request.body).get('tokens', [])

        output = []

        for token in data:
            result = presence_classifier.predict(presence_vect.transform([token]))

            if result == 'Dark':
                cat = category_classifier.predict(category_vect.transform([token]))
                output.append(cat[0])

            else:
                output.append(result[0])

        # dark = [data[i] for i in range(len(output)) if 'Dark' == output[i]]
        dark = [data[i] for i in range(len(output)) if output[i] == 'Dark']
        print(len(output))
        print([item for item in output if item!='Not Dark'])

        message = {'result': output}

        return JsonResponse(message)

    else:
        return JsonResponse({"hello": 'monu saini'})
